document.addEventListener('DOMContentLoaded', () => {

  let request = new XMLHttpRequest();
  let formData = new FormData(document.getElementById('form'));
  let url = document.getElementById('form').getAttribute('action');
  console.log(formData);
  console.log(url);

  request.open('POST', url);
  request.setRequestHeader('Content-type', 'multipart/form-data; boundary=--------')
  request.addEventListener('load', callbackFunction);
  request.send(formData);
});