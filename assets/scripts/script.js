// add class navbarDark on navbar scroll
const header = document.querySelector('.navbar');

window.onscroll = function() {
    var top = window.scrollY;
    if(top >=100) {
        header.classList.add('navbarDark');
    }
    else {
        header.classList.remove('navbarDark');
    }
}

function showOverlay() {
    var overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // Display the overlay


        // Remove the fade-out class if it exists
        overlay.classList.remove('fade-out');
    
        // Trigger reflow before adding the class again
        void overlay.offsetWidth;
        
        // Reapply the fade-out class
        overlay.classList.add('fade-out');
  }

function loadFooter() {
    fetch('/assets/common/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footerSection').innerHTML = html;
        })
        .catch(error => console.error('Error fetching included content:', error));
}