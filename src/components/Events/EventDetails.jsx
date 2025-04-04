import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import { useEffect, useState } from 'react';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false)



  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' })
      navigate('/events');
    }

  })

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    enabled: !!id
  });

  const handleStartDelete = () => { setIsDeleting(true) }
  const handleCancelDelete = () => { setIsDeleting(false) }
  const handleDelete = () => {
    mutate({ id });
  }

  let content;

  if (isPending) {
    content = <div id='events-details-content' className='center'>
      <p>Fetcing event data</p>
    </div>
  }
  if (isError) {
    content = (
      <div id='events-details-content' className='center'>.
        <ErrorBlock title={'Failed to load event'} message={error.info?.message || 'Failed to fetch event data, please try again later'} />
      </div>
    );
  }

  if (data) {
    content = (
      <>
        <header>
          <h1>{data?.title}</h1>
          <nav>
            <button onClick={handleStartDelete} >Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data?.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data?.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data?.date} - {data?.time}</time>
            </div>
            <p id="event-details-description">{data?.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are You sure?</h2>
          <p>Dou  you really want to  delete this edent? This action connot be undone.</p>
          {isPendingDeletion && (
            <p className="pending">Deleting event...</p>
          )}
          {!isPendingDeletion && (
            <div className='form-actions'>
              <button className='button-text' onClick={handleCancelDelete}>Cancel</button>
              <button className='button' onClick={handleDelete}>Delete</button>
            </div>
          )}

          {isErrorDeleting && (
            <ErrorBlock title={"Failed to delete event"} message={error.info?.message || 'Failed to delete event. Please try again later'} />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
