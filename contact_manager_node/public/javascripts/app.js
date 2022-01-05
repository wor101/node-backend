let mainMenu;
let noContacts;
let createContact;
let editContactMenu;
let contactsList;
let contacts;

let ajaxConfigurations = {

  getAllContacts: {
    url: 'http://localhost:3000/api/contacts',
    type: 'GET',
    dataType: 'JSON',
  },

  postContact: {
    url: 'http://localhost:3000/api/contacts/',
    type: 'POST',
    dataType: 'JSON',
    contentType: 'application/json; charset=utf-8',
  },

  deleteContact: {
    type: 'DELETE',
    dataType: 'auto',
  },

  editContact: {
    url: 'http://localhost:3000/api/contacts/',
    type: 'PUT',
    dataType: 'JSON',
    contentType: 'application/json; charset=utf-8',
  },
};

let display = (function () {

  function renderContacts(list = contacts) {
    let contactsTemplate = Handlebars.compile($('#contact_template').html());
    let $ul = $('.contacts_list_div ul');
    $ul.html(contactsTemplate({ contacts: list}));

  }

  return {
    hideAllElements() {
      mainMenu.hide();
      noContacts.hide();
      createContact.hide();
      editContactMenu.hide();
      contactsList.hide();
    },
    
    displayInitialPage() {
      $.ajax(ajaxConfigurations.getAllContacts).done(function(response) {
        contacts = response;
        mainMenu.slideDown(500);

        if (contacts && contacts.length > 0) {
          renderContacts();
          contactsList.slideDown(500);
        } else {
          noContacts.slideDown(500);
        }
      });
    },

    displayContactsList() {
      renderContacts();
      createContact.slideUp(500);
      mainMenu.slideDown(500);
      contactsList.slideDown(500);
    },

    displaySearchResults(list) {
      contactsList.hide();
      renderContacts(list);
      contactsList.show();
    },

    displayEditForm(contactID) {
      let contact = contacts.filter(contact => contact.id === contactID)[0];
      $editForm = $('.edit_contact_form');
      $editForm.attr('data-contact-id', contactID);
      $editForm.find('input[name="full_name"]').attr('value', contact.full_name);
      $editForm.find('input[name="email"]').attr('value', contact.email);
      $editForm.find('input[name="phone_number"]').attr('value', contact.phone_number);
      display.hideAllElements();
      editContactMenu.slideDown(500);
    },
  }
})();

let listeners = (function() {
  function convertFormDataToJSON(formData) {
    let object = {};

    formData.forEach((value, key) => {
      object[key] = value;
    });
    return JSON.stringify(object);
  }

  function deleteContact(target) {
    let confirm = window.confirm('Do you want to delete the contact ?');
    if (confirm) {
      let configuration = ajaxConfigurations.deleteContact;
      configuration.url = target.href;
      $.ajax(configuration).done(function(response, status, xhr) {
        if (status === 'nocontent') {
          $(target).parent('li').remove();
        } else {
          alert(status);
        }
      });
    }    
  }

  function verifyContent(contactData, formElement) {
    let valid = true;


    contactData = JSON.parse(contactData);
    if (contactData.full_name.length >= 1) {

    } else {
      valid = false;
      $(formElement).find('input[name="full_name"]').addClass('.invalid_field');
    }

    if (contactData.email !== undefined && contactData.email.match(/\w+@\w+\.com$/)) {

    } else {
      valid = false;
      $(formElement).find('input[name="email"]').addClass('.invalid_field');
    }

    if (contactData.phone_number !== undefined) {

    } else {
      valid = false;
      $(formElement).find('input[name="phone_number"]').addClass('.invalid_field');
    }
    return valid;
  }

  function uploadEditedContact(event) {
    let formData = new FormData(event.currentTarget);
    let formJSON = convertFormDataToJSON(formData);
    if (verifyContent(formJSON)) {
      let configuration = ajaxConfigurations.editContact;
      configuration.url += $(event.currentTarget).attr('data-contact-id');
      configuration.data = formJSON;
      $.ajax(configuration).done(function(response) {
        display.hideAllElements();
        display.displayInitialPage();
      });
    }



    
  }

  function filterContactsList(searchString) {
    let list = contacts.filter(contact => {
      return contact.full_name.toLowerCase().startsWith(searchString);
    });
    return list;
  }

  return {
    addContactListener() {
      $('.add_contact_button').on('click', event => {
        event.preventDefault();
        mainMenu.slideUp(500);
        noContacts.slideUp(500);
        createContact.slideDown(500);
      });
    },

    addSearchListener() {
      let $searchField = $('.search');
      $searchField.on('keyup', function(event) {
        let key = event.key.toLowerCase();
         if (key >= 'a' && key <= 'z' && key.length === 1) {
           let list = filterContactsList($searchField.val().toLowerCase());
           display.displaySearchResults(list);
         } else if (['backspace', 'delete'].includes(key)) {
          let list = filterContactsList($searchField.val().toLowerCase());
          display.displaySearchResults(list);
         }
      });
    },

    addSubmitContactListener() {
      $('.create_contact_form').on('submit', event => {
        event.preventDefault();
        let formData = new FormData(event.currentTarget)
        let formJSON = convertFormDataToJSON(formData);
        if (verifyContent(formJSON, event.currentTarget)) {
          let configuration = ajaxConfigurations.postContact;
          configuration.data = formJSON;
          $.ajax(configuration).done(function(contact) {
            contacts.push(contact);
            display.displayContactsList()
          });  
        }      
      });
    },

    addContactListLinkListener() {
      contactsList.on('click', event => {
        event.preventDefault();
        let target = event.target;

        if (target.tagName !== 'A') return;
        
        if ($(target).hasClass('delete_contact')) {
           deleteContact(target);
        } else if ($(target).hasClass('edit_contact_button')) {
          let contactID = parseInt($(target).parent('li').attr('id'), 10);
          display.displayEditForm(contactID);
        }      
        
      });
    },

    addEditContactListener() {
      let $form = $('.edit_contact_form');
      $form.on('click', function(event) {
        event.preventDefault();

        if (event.target.id === "submit_edited_contact") {
          uploadEditedContact(event);
        } else if (event.target.tagName === 'BUTTON') {
          editContactMenu.slideUp(500);
          display.displayInitialPage();
        }
      });
    },
  }
})();


function initializeElements() {
  mainMenu = $('.main_menu');
  noContacts = $('.no_contacts');
  createContact = $('.create_contact');
  editContactMenu = $('.edit_contact');
  contactsList = $('.contacts_list_div');
}

function initializeDisplay() {
  display.hideAllElements();
  display.displayInitialPage();
}

function initializeListeners() {
  listeners.addContactListener();
  listeners.addSearchListener();
  listeners.addSubmitContactListener();
  listeners.addContactListLinkListener();
  listeners.addEditContactListener();
}

$(document).ready(function () {
  initializeElements();
  initializeDisplay();
  initializeListeners();
});