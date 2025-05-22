document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  // Список страниц для поиска
  const pages = [
    { url: 'index.html', title: 'Главная' },
    { url: 'russia.html', title: 'Россия' },
    { url: 'evropa.html', title: 'Западная Европа' },
    { url: 'end.html', title: 'Заключение' },
    { url: 'vved.html', title: 'Введение' },
    { url: 'arif.html', title: 'Возникновение арифметики' },
    { url: 'napr.html', title: 'Новые направления' },
    { url: 'mat.html', title: 'Математика в XXI веке' }
  ];

  // Поиск при вводе текста
  searchInput.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchPages(query);
  });

  // Поиск по всем страницам
  async function searchPages(query) {
    let foundResults = false;
    
    for (const page of pages) {
      try {
        const response = await fetch(page.url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Ищем все <p> без классов и ID
        const paragraphs = doc.querySelectorAll('p:not([class]):not([id])');
        
        paragraphs.forEach(p => {
          const text = p.textContent.toLowerCase();
          if (text.includes(query)) {
            const excerpt = p.textContent.substring(0, 100) + '...';
            addResult(page.title, page.url, excerpt, p.textContent);
            foundResults = true;
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки страницы:', page.url, error);
      }
    }
    
    if (foundResults) {
      searchResults.style.display = 'block';
    } else {
      searchResults.innerHTML = '<div class="search-result">Ничего не найдено</div>';
      searchResults.style.display = 'block';
    }
  }

  // Добавление результата в список
  function addResult(pageTitle, pageUrl, excerpt, fullText) {
    const result = document.createElement('div');
    result.className = 'search-result';
    result.innerHTML = `
      <div class="page-title">${pageTitle}</div>
      <div class="excerpt">${excerpt}</div>
    `;
    
    result.addEventListener('click', function() {
      navigateToResult(pageUrl, fullText);
    });
    
    searchResults.appendChild(result);
  }

  // Переход к найденному результату
  function navigateToResult(pageUrl, searchText) {
    // Проверяем, находимся ли мы уже на нужной странице
    if (window.location.pathname.endsWith(pageUrl)) {
      highlightAndScroll(searchText);
    } else {
      // Сохраняем текст для поиска после загрузки страницы
      sessionStorage.setItem('searchQuery', searchText);
      sessionStorage.setItem('scrollToSearch', 'true');
      window.location.href = pageUrl;
    }
  }

  // Подсветка и прокрутка к тексту
  function highlightAndScroll(searchText) {
    const paragraphs = document.querySelectorAll('p:not([class]):not([id])');
    
    paragraphs.forEach(p => {
      if (p.textContent.toLowerCase().includes(searchText.toLowerCase())) {
        // Прокручиваем к найденному параграфу
        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Подсвечиваем текст
        const regex = new RegExp(searchText, 'gi');
        p.innerHTML = p.textContent.replace(regex, 
          match => `<span class="highlight">${match}</span>`
        );
        
        // Убираем подсветку через 5 секунд
        setTimeout(() => {
          const highlights = document.querySelectorAll('.highlight');
          highlights.forEach(hl => {
            hl.outerHTML = hl.textContent;
          });
        }, 5000);
      }
    });
  }

  // Проверяем, нужно ли выполнить поиск после загрузки страницы
  if (sessionStorage.getItem('scrollToSearch') === 'true') {
    const query = sessionStorage.getItem('searchQuery');
    if (query) {
      setTimeout(() => {
        highlightAndScroll(query);
        sessionStorage.removeItem('scrollToSearch');
        sessionStorage.removeItem('searchQuery');
      }, 500);
    }
  }

  // Закрытие результатов при клике вне блока поиска
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
      searchResults.style.display = 'none';
    }
  });
});