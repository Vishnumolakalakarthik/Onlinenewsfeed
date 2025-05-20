document.addEventListener('DOMContentLoaded', function() {
    //addEventListener:Listens for a specific event to happen
    //'DOMContentLoaded':This event fires when the initial HTML document is completely loaded and parsed — no need to wait for images, stylesheets, etc.
    // DOM Elements
    //Get references to elements in your HTML so you can change them dynamically (like adding results or listening for clicks).
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const newsResults = document.getElementById('newsResults');
    const historyList = document.getElementById('historyList');
    const visitedList = document.getElementById('visitedList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const clearVisitedBtn = document.getElementById('clearVisited');
    const suggestionsBox = document.getElementById('suggestions');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    //search history tab and visited articles tab
    const historyContents = document.querySelectorAll('.history-content');

    // API Configuration
    const apiKey = 'f5e3e648463d43698596e74136490196'; // Replace with valid key
    //base endpoint URL of the NewsAP
    const baseUrl = 'https://newsapi.org/v2';
    let currentCategory = 'general';

    // Initialize Trie with keywords
    const newsKeywords = [
        'sports', 'football', 'basketball', 'cricket', 'tennis',
        'technology', 'apple', 'google', 'microsoft', 'ai',
        'business', 'stocks', 'economy', 'market',
        'health', 'medicine', 'fitness', 'nutrition','pawankalyan',
        'politics', 'election', 'government', 'world'
    ];
    newsKeywords.forEach(word => newsTrie.insert(word));

    // Tab switching functionality
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active content
            historyContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    //This block handles tab switching. When a tab button is clicked, it activates the corresponding tab content. It works by matching the button's data-tab value with the id of the tab content section. The active tab is highlighted, and others are hidden

    // Main News Fetch Function
    //When your website fetches news from the NewsAPI, that might take:a few millisecondsor even a couple of seconds depending on internet speed.
    //async:pauses the html page without refreshing
    //query:search term
    async function fetchNews(query = '', category = currentCategory) {
        try {
            newsResults.innerHTML = '<div class="loading">Loading news...</div>';
            
            let url;
            if (query) {
                url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;
            } else {
                url = `${baseUrl}/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;
            }

            // For development, use a CORS proxy
            //the browser may block it due to CORS policy (Cross-Origin Resource Sharing).
            //You → AllOrigins (Proxy) → NewsAPI (Success ✅)
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            // response.json() This is a built-in method that converts the response from the API (which comes as raw text) into a JavaScript object.
            
            if (data.articles && data.articles.length > 0) {
                displayNews(data.articles);
                if (query) {
                    historyStack.push(query);
                    updateHistoryDisplay();
                }
            } else {
                showNoResults(query || category);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showErrorFallback(error, category);
        }
    }

    // Display News Articles
    function displayNews(articles) {
        newsResults.innerHTML = '';
        if (!articles || articles.length === 0) {
            showNoResults();
            return;
        }
        
        articles.slice(0, 10).forEach(article => {
            const articleEl = document.createElement('div');
            articleEl.className = 'news-article';
            
            articleEl.innerHTML = `
                ${article.urlToImage ? 
                    `<img src="${article.urlToImage}" alt="${article.title}" 
                    onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image'">` : 
                    `<div class="no-image">No Image Available</div>`}
                <div class="article-content">
                    <h3>${article.title || 'No Title Available'}</h3>
                    <p class="description">${article.description || 'No description available'}</p>
                    <div class="article-footer">
                        <span class="source">${article.source?.name || 'Unknown Source'}</span>
                        <span class="date">${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Date not available'}</span>
                    </div>
                    <a href="${article.url}" target="_blank" class="read-more" data-article='${JSON.stringify({
                        title: article.title,
                        url: article.url,
                        image: article.urlToImage,
                        source: article.source?.name,
                        date: article.publishedAt
                    })}'>Read more →</a>
                </div>
            `;
            newsResults.appendChild(articleEl);
        });

        // Add click handlers for read more links
        document.querySelectorAll('.read-more').forEach(link => {
            link.addEventListener('click', function(e) {
                const articleData = JSON.parse(this.dataset.article);
                addToVisitedArticles(articleData);
            });
        });
    }

    // Add to visited articles
    function addToVisitedArticles(article) {
        visitedStack.push(article);
        updateVisitedDisplay();
    }

    // Update Visited Articles Display
    function updateVisitedDisplay() {
        const items = visitedStack.toArray();
        
        visitedList.innerHTML = items.length 
            ? items.map(item => `
                <div class="visited-item" data-url="${item.url}">
                    ${item.image ? `<img src="${item.image}" onerror="this.onerror=null;this.src='https://via.placeholder.com/50?text=No+Image'">` : ''}
                    <div class="visited-item-content">
                        <div class="visited-item-title">${item.title || 'No Title'}</div>
                        <div class="visited-item-date">${item.date ? new Date(item.date).toLocaleDateString() : ''}</div>
                    </div>
                </div>
            `).join('')
            : '<p class="no-visited">No visited articles yet.</p>';
        
        document.querySelectorAll('.visited-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                window.open(url, '_blank');
            });
        });
    }

    // Error Handling
    function showNoResults(query = '') {
        const sampleNews = getSampleNews(currentCategory);
        newsResults.innerHTML = `
            <div class="no-news">
                <p>No news found for "${query || currentCategory}". Try a different search.</p>
            </div>
        `;
        displayNews(sampleNews);
    }

    function showErrorFallback(error, category) {
        const sampleNews = getSampleNews(category);
        newsResults.innerHTML = `
            <div class="error">
                <p>${error.message}</p>
                <p>Showing sample news for ${category}...</p>
            </div>
        `;
        displayNews(sampleNews);
    }

    // Sample News Data when the api fails or doesnot works
    function getSampleNews(category) {
        const samples = {
            sports: [
                {
                    title: "Local Team Wins Championship",
                    description: "The home team won the national finals in an exciting overtime match.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=Sports+News",
                    source: { name: "Sports Daily" },
                    publishedAt: new Date().toISOString()
                },
                {
                    title: "Olympic Athlete Sets New Record",
                    description: "National athlete breaks world record in 100m sprint.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=Athletics",
                    source: { name: "Olympic News" },
                    publishedAt: new Date().toISOString()
                }
            ],
            technology: [
                {
                    title: "New Smartphone Released",
                    description: "Latest model features breakthrough camera technology and extended battery life.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=Tech+News",
                    source: { name: "Tech Today" },
                    publishedAt: new Date().toISOString()
                }
            ],
            general: [
                {
                    title: "Important Community Announcement",
                    description: "City council announces new infrastructure projects.",
                    url: "#",
                    urlToImage: "https://via.placeholder.com/300x200?text=General+News",
                    source: { name: "Community News" },
                    publishedAt: new Date().toISOString()
                }
            ]
        };
        
        return samples[category] || samples.general;
    }

    // Event Listeners and Initialization
    searchInput.addEventListener('input', function() {
        const input = this.value.toLowerCase();
        suggestionsBox.innerHTML = '';
        
        if (input.length >= 2) {
            const suggestions = newsKeywords.filter(word => 
                word.startsWith(input) && word !== input
            ).slice(0, 5);

            suggestions.forEach(word => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.innerHTML = `<i class="fas fa-search"></i> ${word}`;
                suggestion.addEventListener('click', () => {
                    searchInput.value = word;
                    suggestionsBox.style.display = 'none';
                    fetchNews(word);
                });
                suggestionsBox.appendChild(suggestion);
            });
            suggestionsBox.style.display = suggestions.length ? 'block' : 'none';
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) fetchNews(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            fetchNews(searchInput.value.trim());
        }
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            fetchNews('', currentCategory);
        });
    });

    clearHistoryBtn.addEventListener('click', () => {
        historyStack.clear();
        updateHistoryDisplay();
    });

    clearVisitedBtn.addEventListener('click', () => {
        visitedStack.clear();
        updateVisitedDisplay();
    });

    // Initialize
    fetchNews();
    categoryButtons[0].classList.add('active');
    updateVisitedDisplay();
});

// Update History Display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const items = historyStack.toArray();
    
    historyList.innerHTML = items.length 
        ? items.map(item => `<div class="history-item"><i class="fas fa-search"></i> ${item}</div>`).join('')
        : '<p class="no-history">No search history yet.</p>';
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('searchInput').value = item.textContent.trim();
            fetchNews(item.textContent.trim());
        });
    });
}