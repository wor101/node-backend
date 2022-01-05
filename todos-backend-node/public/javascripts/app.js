"use strict";

let todoData = {
  completed: [],
  selected: [],
  todos: [],
  done: [],
  todos_by_date: {},
  done_todos_by_date: {},
  current_section: {
    title: 'All Todos',
    data: 0,
    unfinished: true,
  },
};

let listeners = (function() {

  function convertFormDataToJSON(formData) {
    let formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });
    return formObject;
  }

  function removeEmptyKeyValuePairs(formObject) {
    Object.keys(formObject).forEach(key => {
      if (formObject[key] === '') {
        delete formObject[key];
      }
    });
  }

  function updateTodoData(selectedArray, newTitle, unfinished) {
    todoData.selected = selectedArray.slice();
    todoData.current_section.title = newTitle;
    todoData.current_section.data = todoData.selected.length;
    todoData.current_section.unfinished = unfinished;
  }

  function addNewTodoListener() {
    let $label = $('label[for="new_item"]');
    $label.on('click', event => {
      event.preventDefault();
      renderPage.displayModals();
    });
  }

  function addModalLayerListener() {
    $('#modal_layer').on('click', event => {
      event.preventDefault();
      renderPage.hideModals();
    });
  }

  function addFormModalLayerListener() {
    let $form_modal = $('#form_modal');
    let $inputSave = $('#form_modal input[type="submit"]');
    let $buttonComplete = $('#form_modal button[name="complete"]');

    $form_modal.on('submit', event => {
      event.preventDefault();
    })

    $inputSave.on('click', event => {
      event.preventDefault();
   
      let formData = new FormData($form_modal.children('form').get()[0]);
      let formObject = convertFormDataToJSON(formData);

      if ($form_modal.attr('data-id')) {
         console.log('PUT request');
         removeEmptyKeyValuePairs(formObject);
         ajaxRequests.updateTodo(JSON.stringify(formObject), $form_modal.attr('data-id'));
      } else {
        if (formObject.title.length >= 3) {
          ajaxRequests.saveNewTodo(JSON.stringify(formObject));
        } else {
          alert('The title must be at least 3 characters long.');
        }
      }
    });
    
    $buttonComplete.on('click', event => {
      let formData = new FormData($form_modal.children('form').get()[0]);
      let formObject = convertFormDataToJSON(formData);

      if ($form_modal.attr('data-id')) {
        removeEmptyKeyValuePairs(formObject);
        formObject.completed = true;
        ajaxRequests.updateTodo(JSON.stringify(formObject), $form_modal.attr('data-id'));
      } else {
        alert('Cannot mark as complete as item has not been created yet!');
      }
    });
  }

  function addSelectedListListeners() {
    $('tbody').on('click', event => {
      event.preventDefault();
      event.stopPropagation();
      let target = event.target;
      let id = $(target).closest('tr').attr('data-id');
      
      if (target.matches('label')) {
        renderPage.displayModals(id);
      } else if (target.matches('input[type="checkbox"]') || target.matches('td.list_item') || target.matches('span.check')) {
        let todoObject = todoData.todos.filter(todo => String(todo.id) === String(id))[0];
        removeEmptyKeyValuePairs(todoObject);
        todoObject.completed = todoObject.completed ? false : true;
        ajaxRequests.updateTodo(JSON.stringify(todoObject), id);
      } else if (target.matches('td.delete') || $(target).closest('td.delete').length) {
        ajaxRequests.deleteTodo(id);
      }
    });
  }

  function addAllTodosListener() {
    $('#all_todos').on('click', event => {
      updateTodoData(todoData.todos, 'All Todos', true);
      renderPage.updateTodos();
    });
  }

  function addAllListsListener() {
    $('#all_lists').on('click', event => {
      if (event.target.tagName === 'ARTICLE') return;

      let dateKey = $(event.target).closest('dl').attr('data-title');
      updateTodoData(todoData.todos_by_date[dateKey], dateKey, true);
      renderPage.updateTodos();
    });
  }

  function addCompletedTodosListener() {
    $('#completed_todos').on('click', event => {
      updateTodoData(todoData.done, 'Completed', false);
      renderPage.updateTodos();
    });
  }

  function addCompletedListsListener() {
    $('#completed_lists').on('click', event => {
      if (event.target.tagName === 'ARTICLE') return;

      let dateKey = $(event.target).closest('dl').attr('data-title');
      updateTodoData(todoData.done_todos_by_date[dateKey], dateKey, false);
      renderPage.updateTodos();
    });
  }

  return {
    setListeners() {
      addNewTodoListener();
      addSelectedListListeners();
      addAllTodosListener();
      addAllListsListener();
      addCompletedTodosListener();
      addCompletedListsListener();
      addModalLayerListener();
      addFormModalLayerListener();
    },
  }
})();

let renderPage = (function() {

  function sortSidebarTodoLists(elements) {
    return elements.sort((elem1, elem2) => {
      let date1 = $(elem1).attr('data-title');
      let date2 = $(elem2).attr('data-title');

      if (date1 === 'No Due Date') {
        return -1;
      } else {
        let year1 = date1.slice(3);
        let month1 = date1.slice(0, 2);
        let year2 = date2.slice(3);
        let month2 = date2.slice(0, 2);
        date1 = new Date(year1, month1);
        date2 = new Date(year2, month2);
  
        if (date1 < date2) {
          return -1;
        } else if (date1 > date2) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  function sortListElements(parent, childrenTagName = 'dl') {
    let sortedElements = sortSidebarTodoLists(parent.children(childrenTagName).get());
    sortedElements.forEach(elem => parent.append(elem));
  }

  function sortSelectedArray() {
    let selected = todoData.selected;
    let unfinished = selected.filter(todo => !todo.completed);
    let completed = selected.filter(todo => todo.completed)

    unfinished.sort((todo1, todo2) => parseInt(todo1.id, 10) - parseInt(todo2.id, 10));
    completed.sort((todo1, todo2) => parseInt(todo1.id, 10) - parseInt(todo2.id));
    todoData.selected = unfinished.concat(completed);
  }

  function redisplaySelected() {
    sortSelectedArray();
    let selectedHTML = renderPage.list_template({selected: todoData.selected});
    $('tbody').html(selectedHTML);
  }

  function redisplayTitle() {
    let current_section = todoData.current_section;
    let current_sectionHTML = renderPage.title_template({ current_section: current_section });
    $('#items header').html(current_sectionHTML);
  }

  function redisplayAllTodosSidebar() {
    let todos_by_date = todoData.todos_by_date;
    let todos_by_dateHTML = renderPage.all_list_template({todos_by_date: todos_by_date});
    $('#all_lists').html(todos_by_dateHTML);
    $('#all_header dd').text(todoData.todos.length);
    sortListElements($('#all_lists'), 'dl');
  }

  function redisplayCompletedTodosSidebar() {
    let done_todos_by_date = todoData.done_todos_by_date;
    let done_todos_by_dateHTML = renderPage.completed_list_template({done_todos_by_date: done_todos_by_date});
    $('#completed_lists').html(done_todos_by_dateHTML);
    $('#all_done_header dd').text(todoData.done.length);
    sortListElements($('#completed_lists'), 'dl');
  }

  function removeActiveClassFromSideBar() {
    $('#all_todos header').removeClass('active');
    $('#sidebar article dl.active').removeClass('active');
    $('#completed_todos header').removeClass('active');
  }

  function setSelectedSection() {
    removeActiveClassFromSideBar();
    let currentSectionTitle = todoData.current_section.title; 
    let queryString;

    if (currentSectionTitle === 'All Todos') {
      queryString = '#all_todos header';
    } else if(currentSectionTitle === 'Completed') {
      queryString ='#completed_todos header';
    } else if (todoData.current_section.unfinished) {
      queryString = `#all_lists dl[data-title="${currentSectionTitle}"]`;
    } else {
      queryString = `#completed_lists dl[data-title="${currentSectionTitle}"]`;
    }

    $(queryString).addClass('active');
  }

  function clearModalValues() {
    $('#form_modal').removeAttr('data-id');
    $('#title').val('');
    $('#day').val('');
    $('#month').val('');
    $('#year').val('');
    $('#description').val('')
  }

  function fillModalValues(id) {
    let todoObject = todoData.todos.filter(todo => String(todo.id) === String(id))[0];
    $('#form_modal').attr('data-id', todoObject.id);
    $('#title').val(todoObject.title);
    $('#day').val(todoObject.day);
    $('#month').val(todoObject.month);
    $('#year').val(todoObject.year);
    $('#description').val(todoObject.description);
  }

  return {
    buildHandlebarsTemplates() {
      this.item_partial = Handlebars.compile($('#item_partial').html());
      this.list_template = Handlebars.compile($('#list_template').html());
      this.title_template = Handlebars.compile($('#title_template').html());
      this.completed_list_template = Handlebars.compile($('#completed_list_template').html());
      this.completed_todos_template = Handlebars.compile($('#completed_todos_template').html());
      this.all_list_template = Handlebars.compile($('#all_list_template').html());
      this.all_todos_template = Handlebars.compile($('#all_todos_template').html());
      let main_template = Handlebars.compile($('#main_template').html());    
    
      Handlebars.registerPartial('item_partial', $('#item_partial').html());
      Handlebars.registerPartial('list_template', $('#list_template').html());
      Handlebars.registerPartial('title_template', $('#title_template').html());
      Handlebars.registerPartial('completed_list_template', $('#completed_list_template').html());
      Handlebars.registerPartial('completed_todos_template', $('#completed_todos_template').html());
      Handlebars.registerPartial('all_list_template', $('#all_list_template').html());
      Handlebars.registerPartial('all_todos_template', $('#all_todos_template').html());
      
      $('body').html(main_template(todoData));
    },

    displayModals(id = null) {
      $('#form_modal').show();
      $('#modal_layer').show();
      if (id) {
        fillModalValues(id)
      } else {
        clearModalValues();
      }
    },

    hideModals() {
      $('#form_modal').hide();
      $('#modal_layer').hide();
    },

    updateTodos(){
      redisplaySelected();
      redisplayTitle();
      redisplayAllTodosSidebar();
      redisplayCompletedTodosSidebar();
      setSelectedSection()
    }
  }
})();

let ajaxRequests = (function() {

  function buildDateKey(todo) {
    let month = String(todo.month);
    let year = String(todo.year).slice(2);

    if (!month || !year) {
      return 'No Due Date';
    }

    if (month.length < 2) {
      month = '0' + month;
    }
    return month + '/' + year;
  }

  function updateTodoSelected(todo) {
    let dateKey = buildDateKey(todo);
    let currentSectionTitle= todoData.current_section.title
    let activeList = todoData.current_section.unfinished;

    if (currentSectionTitle === 'All Todos') {
      todoData.selected.push(todo);
    } else if (dateKey === currentSectionTitle) {
      if (activeList) {
        todoData.selected.push(todo);
      } else if (!activeList && todo.completed === true) {
        todoData.selected.push(todo);
      }
    }
  }

  function updateTodoCompleted(todo) {
    if (todo.completed === true) {
      todoData.completed.push(todo);
      todoData.done.push(todo);
    }
  }

  function updateTodosByDate(todo) {
      let todos_by_date = todoData.todos_by_date;
      let dateKey = todo.due_date;

      todos_by_date[dateKey] ? todos_by_date[dateKey].push(todo) :  todos_by_date[dateKey] = [todo]; 
  }

  function updateDoneTodosByDate(todo) {
    let dateKey = todo.due_date;

    if (todo.completed === true) {
      let done_todos_by_date = todoData.done_todos_by_date;
      done_todos_by_date[dateKey] ? done_todos_by_date[dateKey].push(todo) : done_todos_by_date[dateKey] = [todo];
    }
  }

  function buildTodoData(allTodos) {
    allTodos.forEach(todo => {
      addTodoToData(todo);
    });
  }

  function addTodoToData(todo) {
    todo.due_date = buildDateKey(todo);
    todoData.todos.push(todo);
    updateTodoSelected(todo);
    updateTodoCompleted(todo);
    updateTodosByDate(todo);
    updateDoneTodosByDate(todo);
    todoData.current_section.data = todoData.selected.length;
  }

  function removeTodoFromDateObjects(id, dateObject) {
    Object.keys(dateObject).forEach(key => {
      dateObject[key] = dateObject[key].filter(todo => {
        return (String(todo.id) !== id);
      });
    });

    Object.keys(dateObject).forEach(key => {
      if (dateObject[key].length <= 0) {
        delete dateObject[key];
        console.log(key);
      }
    });
  }

  function removeTodoFromData(id) {
    todoData.completed = todoData.completed.filter(todo => String(todo.id) !== String(id));
    todoData.selected = todoData.selected.filter(todo => String(todo.id) !== String(id));
    todoData.todos = todoData.todos.filter(todo => String(todo.id) !== String(id));
    todoData.done = todoData.done.filter(todo => String(todo.id) !== String(id));
    todoData.current_section.data = todoData.selected.length;
    removeTodoFromDateObjects(id, todoData.todos_by_date);
    removeTodoFromDateObjects(id, todoData.done_todos_by_date);
  }

  return {
    retrieveAllTodos() {
      $.ajax({
        url: '/api/todos',
        type: 'GET',
        dataType: 'json',
      }).done(function(response) {
        buildTodoData(response);
        renderPage.buildHandlebarsTemplates();
        renderPage.updateTodos();      
        listeners.setListeners();
      }).fail(function(xhr, status, error){
        alert(`Uh Oh! Status: ${status}, Error:${error}`);
      });
    },

    saveNewTodo(todoJSON){
      $.ajax({
        url: '/api/todos',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: todoJSON,
        dataType: 'json',
      }).done(response => {
        addTodoToData(response);
        todoData.current_section.title = 'All Todos';
        todoData.selected = todoData.todos.slice();
        renderPage.updateTodos();
        renderPage.hideModals();
        return response;
      }).fail(function(xhr, status, error) {
        alert(`Uh Oh! Status: ${status}, Error: ${error}`);   
      });
    },

    deleteTodo(id){
      $.ajax({
        url: '/api/todos/' + id,
        type: 'DELETE',
      }).done(function(response) {
        removeTodoFromData(id);
        renderPage.updateTodos();
      }).fail(function(xhr, status, error) {
        alert(`Uh Oh! Status: ${status}, Error: ${error}`);  
      });
    },

    updateTodo(todoJSON, id) {
      $.ajax({
        url: '/api/todos/' + String(id),
        type: 'PUT',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: todoJSON,
      }).done(response => {
        removeTodoFromData(id);
        addTodoToData(response);
        renderPage.updateTodos();
        renderPage.hideModals();
      }).fail(function(xhr, status, error) {
        alert(`Uh Oh! Status: ${status}, Error: ${error}`);  
      });
    }
  }
})();

$(document).ready(function() {
  ajaxRequests.retrieveAllTodos();
});
