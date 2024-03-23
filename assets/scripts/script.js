// This scripts had various functions to load common sections, showing overlays and do reactive changes to the site.
// © 2024 Sjur Barndon <sjurbarndon@proton.me>


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

  //loads both the footer and the navigation bar, also listens for scroll down:
function loadFooter() {
    fetch('/assets/common/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footerSection').innerHTML = html;
        })
        .catch(error => console.error('Error fetching included content:', error));

    fetch('/assets/common/navigation.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('myNavigationBar').innerHTML = html;    
            // Add class navbarDark on navbar scroll
            const header = document.querySelector('.navbar');
            var isNavbarDark = false;
    
            window.addEventListener('scroll', function() {
                var top = window.scrollY;
                if (top >= 100 && !isNavbarDark) {
                    header.classList.add('navbarDark', 'show');
                    isNavbarDark = true;
                } else if (top < 100 && isNavbarDark) {
                    header.classList.remove('show');
                    isNavbarDark = false;
                }
            });
        })
        .catch(error => console.error('Error fetching included content:', error));

    fetch('/assets/common/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('headerSection').innerHTML = html;
        })
        .catch(error => console.error('Error fetching included content:', error));

}


//For fullscreen image on click:
window.addEventListener("load", () => {
    for (let i of document.querySelectorAll(".gallery img")) {
      i.onclick = () => i.classList.toggle("full");
    }
  });


// for side panel in image gallery:

// Get elements
const togglePanelButton = document.getElementById('togglePanelButton');
const sidePanel = document.getElementById('sidePanel');
const content = document.querySelector('.gallery');

// Toggle panel
togglePanelButton.addEventListener('click', () => {
  // Check if the panel is currently closed
  const isClosed = sidePanel.style.left === '-40%';
  
  // Toggle the panel state
  if (isClosed) {
    // Open the panel
    content.classList.toggle("gallery-pushed")
    sidePanel.classList.toggle("sidePanelToggled")
    togglePanelButton.classList.toggle("toggleButtonToggled")

  } else {
    // Close the panel
    content.classList.toggle("gallery-pushed")
    sidePanel.classList.toggle("sidePanelToggled")
    togglePanelButton.classList.toggle("toggleButtonToggled")
  }
});


//for master thesis scroll 
document.getElementById('domain_display').innerHTML = html;    
  // Add class navbarDark on navbar scroll
  const header = document.querySelector('.banner');
     
  window.addEventListener('scroll', function() {
    var top = window.scrollY;
    if (top >= 500) {
      header.classList.add('scrollup');
    } else if (top < 500) {
      header.classList.remove('scrollup');
     }
  });


  function icon_hover_animation(element, enter, leave){
    element.addEventListener('mouseenter', enter)
    element.addEventListener('mouseleave', leave)
  }


  icon_hover_animation(document.querySelector('.icon'), e => {
    // On hover
    e.target.classList.add("logo__container--hover")
  }, e => {
    // On exit hover
    e.target.classList.remove("logo__container--hover")
  })