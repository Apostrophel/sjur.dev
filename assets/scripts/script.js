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


// Device Detection Utilities
const DeviceDetector = {
    // Check if device is mobile
    isMobile: () => {
        return window.innerWidth <= 576;
    },
    
    // Check if device is tablet
    isTablet: () => {
        return window.innerWidth > 576 && window.innerWidth <= 992;
    },
    
    // Check if device is desktop
    isDesktop: () => {
        return window.innerWidth > 992;
    },
    
    // Check if device supports touch
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Get current screen size category
    getScreenSize: () => {
        const width = window.innerWidth;
        if (width <= 576) return 'mobile';
        if (width <= 768) return 'small-tablet';
        if (width <= 992) return 'tablet';
        return 'desktop';
    },
    
    // Add responsive classes to body
    addResponsiveClasses: () => {
        const body = document.body;
        body.classList.remove('mobile', 'tablet', 'desktop', 'touch-device');
        
        if (DeviceDetector.isMobile()) {
            body.classList.add('mobile');
        } else if (DeviceDetector.isTablet()) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }
        
        if (DeviceDetector.isTouchDevice()) {
            body.classList.add('touch-device');
        }
    }
};

// Initialize responsive classes on load
window.addEventListener('load', () => {
    DeviceDetector.addResponsiveClasses();
});

// Update classes on window resize
window.addEventListener('resize', () => {
    DeviceDetector.addResponsiveClasses();
});

// Mobile-specific optimizations
if (DeviceDetector.isMobile()) {
    // Disable background-attachment: fixed on mobile for better performance
    window.addEventListener('load', () => {
        const heroSections = document.querySelectorAll('.bgimage, .bgimage_projects, .bgimage_thesis');
        heroSections.forEach(section => {
            section.style.backgroundAttachment = 'scroll';
        });
    });
}
 