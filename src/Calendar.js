import React, { useState, useEffect } from 'react';
import './FormStyles.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [username, setUsername] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [newGoal, setNewGoal] = useState({
        goalText: '',
        cadence: 'DAILY',
      });
  
    const handleUsernameSubmit = e => {
      e.preventDefault();
  
      // Fetch events based on the entered username
      if (username.trim() !== '') {
        fetchEvents(username.trim());
      }
    };

    const handleNewGoalSubmit = e => {
        e.preventDefault();
    
        // Send a POST request to create a new goal
        if (newGoal.goalText.trim() !== '') {
          createNewGoal(newGoal);
        }
        fetchEvents(username);
        fetchEvents(username);
      };
  
    const fetchEvents = enteredUsername => {
      // Your API endpoint with the entered username
      const apiUrl = `https://n8vsi3jqh4.execute-api.us-east-1.amazonaws.com/Prod/api/NYRItems/GetByUsername/${encodeURIComponent(enteredUsername)}`;
  
      // Fetch events from your API here
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Process the data to generate events
          const processedEvents = processData(data);
  
          // Set the processed events to the state
          setEvents(processedEvents);
  
          // Update welcome message
          setWelcomeMessage(`Welcome ${enteredUsername}!`);
        })
        .catch(error => {
          console.error('Error fetching events:', error);
        });
    };
  const processData = data => {
    // Process the data to generate events
    const processedEvents = [];

    data.forEach(event => {
        var backgroundColor = 'white';
        var textColor = '#007bff';
        var borderColor = '#007bff'

      if (event.checkIn) {
        backgroundColor = '#007bff';
        textColor = 'white';
        borderColor = '#007bff'
      } 

      processedEvents.push({
        id: event.id,
        title: event.goalText,
        start: event.startDate,
        end: event.endDate,
        allDay: true,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        textColor: textColor
      });
    });

    return processedEvents;
  };

  const createNewGoal = newGoalData => {
    // Your API endpoint to create a new goal
    const apiUrl = 'https://n8vsi3jqh4.execute-api.us-east-1.amazonaws.com/Prod/api/NYRItems';

    // Send POST request to create a new goal
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        goalText: newGoalData.goalText,
        cadence: newGoalData.cadence,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Reset the newGoal state
        setNewGoal({
          goalText: '',
          cadence: 'DAILY',
        });
      })
      .catch(error => {
        console.error('Error creating new goal:', error);
      });
  };

  const handleEventClick = info => {
    console.log(info.event.id)
    // Toggle event color between blue and white
    const updatedEvents = events.map(event => {
      if (event.id === parseInt(info.event.id, 10)) {
        const newCheckInValue = !event.backgroundColor.includes('#007bff');

        // Send PUT request to update API
        updateCheckInStatus(event.id, newCheckInValue);
      }
      return event;
    });
    fetchEvents(username);
    // 2nd one needed to refresh
    fetchEvents(username);
  };

  const updateCheckInStatus = (eventId, checkInValue) => {
    // Send PUT request to update API with the eventId and checkInValue
    const apiUrl = `https://n8vsi3jqh4.execute-api.us-east-1.amazonaws.com/Prod/api/NYRItems/PutCheckIn`;
    fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: eventId,
        value: checkInValue 
    }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Check-in status updated successfully:', data);
      })
      .catch(error => {
        console.error('Error updating check-in status:', error);
      });
  };

  return (
    <div>
    <form className="form-container" onSubmit={handleUsernameSubmit}>
      {welcomeMessage ? (
        <div className="welcome-message">{welcomeMessage}</div>
      ) : (
        <div>
          <label className="form-label">
            Enter your username:
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <button className="form-submit-button" type="submit">
            Submit
          </button>
        </div>
      )}   
    </form>
       {welcomeMessage && (
        <div>
        <form className="form-container" onSubmit={handleNewGoalSubmit}>
          <label className="form-label">
            Add a New Resolution:
            <input
              className="form-input"
              type="text"
              value={newGoal.goalText}
              onChange={(e) => setNewGoal({ ...newGoal, goalText: e.target.value })}
            />
          </label>
          <label className="form-label">
            Cadence:
            <select
              className="form-input"
              value={newGoal.cadence}
              onChange={(e) => setNewGoal({ ...newGoal, cadence: e.target.value })}
            >
              <option value="DAILY">DAILY</option>
              <option value="WEEKLY">WEEKLY</option>
              <option value="MONTHLY">MONTHLY</option>
            </select>
          </label>
          <button className="form-submit-button" type="submit">
            Add Goal
          </button>
        </form>
      </div>
      )}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
      />
    </div>
  );
};

export default Calendar;
