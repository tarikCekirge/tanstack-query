import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery, QueryClient } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const submit = useSubmit()
  const { id } = useParams()
  const navigate = useNavigate();
  const { state } = useNavigation()


  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 10000
  })


  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ['events', id] });
  //     const previousEvent = queryClient.getQueryData(['events', id]);

  //     queryClient.setQueryData(['events', id], newEvent);

  //     return { previousEvent };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', id]);
  //   }
  // });


  function handleSubmit(formData) {
    // mutate({ id, event: formData });
    // navigate('../');

    submit(formData, { method: 'PUT' })
  }

  function handleClose() {
    navigate('../');
  }

  let content;


  if (isError) {
    content = (
      <>
        <ErrorBlock title={"Failed to load event"} message={error.info?.message || "Failed to load event. Please try again later."} />
        <div className='form-actions'>
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>

    )
  }

  if (data) {
    content = (<EventForm inputData={data} onSubmit={handleSubmit}>
      {state === 'submitting' ? (
        <>
          <p>Sending Data</p>
        </>
      ) : (
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </>
      )}
    </EventForm>)
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}


export const loader = ({ params }) => {
  const { id } = params;
  return queryClient.fetchQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });
};

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}