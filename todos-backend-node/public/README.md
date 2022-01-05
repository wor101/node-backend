APPLICATION EXECUTION OVERVIEW:
- Application waits for DOM to load and then calls 'ajaxRequests.retrieveAllTodos()'
- Ajax request sent to server for all todos and response used to:
  - set values for the 'todoData' object
  - call 'renderPage.buildHandlebarsTemplates()' to compile/register handlebar templates and create document HTML
  - call 'renderPage.updateTodos()' to update the HTML properly sorted lists
  - call 'listeners.setListeners()' to set event listeners on page elements
- Application awaits user action to trigger event listeners 

APPLICATION DATA OVERVIEW:
- 'todoData': stores todo and application state data for use throughout the application

- 'ajaxRequests': methods for common ajax requests and private functions for handling responses
  - Ajax Methods
    - 'retrieveAllTodos' 
      - retrieves all todos from server 
      - On success: sets values of 'todoData', renders page, and sets listeners
    - 'saveNewTodo'
      - sends a new todo to the server
      - On success: adds new todo to 'todoData', renders page with new todo details included
    - 'deleteTodo'
      - requests a todo be deleted from the server
      - On success: removes todo from 'todoData', renders page without the deleted todo's details
    - 'updateTodo'
      - requests an existing todo be updated on the server
      - On success: removes original todo from 'todoData', adds updated todo to 'todoData', renders page with updated todo included
  - private functions used to construct and update 'todoData' with response data received from server

- 'renderPage': methods for creating handlebar templates, displaying the modal, and updating the page with data from 'todoData'
  - Methods
    - 'buildHandlebarsTemplates': compiles/registers templates and adds HTML to page body using 'todoData'
    - 'displayModals': displays form and layer modal, and ensures form contains any required data
    - 'hideModals': hides the form and layer modals
    - 'updateTodos': updates current page state using JavaScript and data from 'todoData'
  - Private functions used to sort, format, and display 'todoData' on the page 

- 'listeners': sets event listeners to respond to user actions by calling methods from 'ajaxRequests' and 'renderPage' 
  - 'setListeners': calls private functions to add event listeners to page
    - 'addNewTodoListener': 
      - listens for 'click' event on the 'Add new todo' label
      - calls method from 'renderPage' to display the modal
    - 'addModalLayerListener': 
      - listens for 'click' event on transparent modal layer 
      - calls method from 'renderPage' to hide modal form and layer
    - 'addFormModalLayerListener': 
      - listens for 'click' event on the modal form 
      - calls methods from 'ajaxRequests' to either add or update a todo
    - 'addSelectedListListeners': 
      - listens for 'click' event on the page body
      - either calls methods from 'renderPage' to display modals, or calls 'ajaxRequests' to update or delete a todo
    - 'addAllTodosListener', 'addAllListsListener', 'addCompletedTodosListener', 'addCompletedListsListener': 
      - listens for 'click' event on relevant sidebar section
      - calls private 'updateTodoData' function to update 'todoData' with currently selected section
      - calls method from 'renderPage' to update page with currently selected todo data
