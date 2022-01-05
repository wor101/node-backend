// app.js file contents
 document.addEventListener('DOMContentLoaded', () => {
   
  document.querySelector('.popUp').addEventListener('click', function(event) {
    event.stopPropagation();
    alert(event.target.textContent);
  }, true);
  
  document.querySelector('.highlight').addEventListener('click', function(event) {
    event.target.setAttribute('style', 'color:red');
  });


});
