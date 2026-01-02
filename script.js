document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header'); // Added: Select the header element

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');

            // Simple animation for the hamburger icon
            const spans = menuToggle.querySelectorAll('span');
            if (nav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Set active link based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('header nav a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop() || (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Add scroll effect for homepage header
    if (document.body.classList.contains('home-page')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // BACKEND DISABLED: Load latest content for the homepage
    // if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    //     loadLatestContent();
    // }
});

// BACKEND DISABLED: Dynamic content loading disabled - content is now static in HTML
/*
async function loadLatestContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('Failed to load content');
        const data = await response.json();

        // 1. Update Journey Card
        if (data.journey && data.journey.length > 0) {
            const latestJourney = data.journey[data.journey.length - 1];
            const journeyImg = document.getElementById('journey-img');
            const journeyTitle = document.getElementById('journey-title');
            const journeyDesc = document.getElementById('journey-desc');

            if (journeyImg) journeyImg.src = latestJourney.imageUrl;
            if (journeyTitle) journeyTitle.textContent = latestJourney.title;
            // Create a temporary element to strip HTML tags from content for the preview
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = latestJourney.content;
            if (journeyDesc) journeyDesc.textContent = tempDiv.textContent.substring(0, 200) + '...';
        }

        // 2. Update Episodes Card
        if (data.episodes && data.episodes.length > 0) {
            const latestEpisode = data.episodes[data.episodes.length - 1];
            const episodeImg = document.getElementById('episode-img');
            const episodeTitle = document.getElementById('episode-title');
            const episodeDesc = document.getElementById('episode-desc');

            // Extract Video ID to get thumbnail
            let videoId = '';
            const urlParts = latestEpisode.videoUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart.includes('watch?v=')) {
                videoId = lastPart.split('v=')[1].split('&')[0];
            } else {
                videoId = lastPart;
            }

            if (episodeImg) episodeImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            if (episodeTitle) episodeTitle.textContent = latestEpisode.title;
            if (episodeDesc) episodeDesc.textContent = latestEpisode.description;
        }

        // 3. Update Blog Card
        if (data.blog && data.blog.length > 0) {
            const latestBlog = data.blog[data.blog.length - 1];
            // Blog usually doesn't have an image in this JSON structure based on previous artifact,
            // so we might keep the static one or if there's an imageUrl property we use it.
            // checking content.json: blog items have id, date, title, summary. No image.

            const blogTitle = document.getElementById('blog-title');
            const blogDesc = document.getElementById('blog-desc');

            if (blogTitle) blogTitle.textContent = latestBlog.title;
            if (blogDesc) blogDesc.textContent = latestBlog.summary;
        }

    } catch (error) {
        console.error('Error loading latest content:', error);
    }
}
*/
