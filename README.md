# Инструкция по настройке интеграции с Google Таблицами

## Шаг 1: Создание Google Таблицы

1. Перейдите на [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. Назовите её "Wish-лист бронирования" или любым удобным именем
4. Скопируйте ID таблицы из URL (длинная строка между `/d/` и `/edit`) 1yDKAVW0Rli6rlvm7BQNE933kDcz_x6CO60NnkyMIS0A

## Шаг 2: Создание Google Apps Script

1. Перейдите на [Google Apps Script](https://script.google.com)
2. Нажмите "Новый проект"
3. Удалите весь код в файле `Code.gs`
4. Скопируйте и вставьте код из файла `google-script.js`
5. Замените `YOUR_SPREADSHEET_ID_HERE` на ID вашей таблицы
6. Замените `parents@example.com` на ваш реальный email

## Шаг 3: Настройка разрешений

1. В Google Apps Script нажмите "Сохранить" (Ctrl+S)
2. Нажмите "Выполнить" для тестирования
3. Предоставьте необходимые разрешения для доступа к таблицам и отправки email

## Шаг 4: Развертывание веб-приложения

1. В Google Apps Script нажмите "Развернуть" → "Новое развертывание"
2. Выберите тип "Веб-приложение"
3. Настройки:
   - Описание: "Wish-лист API"
   - Кто имеет доступ: "Все"
   - Выполнить как: "Я"
4. Нажмите "Развернуть"
5. Скопируйте URL веб-приложения

## Шаг 5: Обновление HTML

В файле `index.html` найдите строку:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
```

Замените `YOUR_GOOGLE_SCRIPT_URL_HERE` на URL, полученный на предыдущем шаге.

## Шаг 6: Тестирование

1. Откройте ваш HTML файл в браузере
2. Попробуйте забронировать подарок
3. Проверьте, что данные появились в Google Таблице
4. Проверьте, что пришло уведомление на email

## Структура данных в таблице

Таблица будет содержать следующие столбцы:
- Дата/Время - когда была сделана бронь
- Подарок - название забронированного подарка
- Имя - имя человека, сделавшего бронь
- Телефон - контактный телефон
- Email - email адрес (опционально)
- Сообщение - дополнительное сообщение

## Дополнительные возможности

### Автоматическое обновление статуса бронирования

Чтобы сайт автоматически показывал забронированные подарки, можно добавить в HTML код для загрузки актуального статуса:

```javascript
// Добавьте эту функцию в script секцию HTML
async function loadReservedGifts() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();
    
    if (data.status === 'success') {
      // Обновляем статус подарков
      gifts.forEach(gift => {
        gift.reserved = data.reservedGifts.includes(gift.name);
      });
      renderGifts();
    }
  } catch (error) {
    console.error('Ошибка загрузки статуса бронирований:', error);
  }
}

// Вызывайте эту функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  loadReservedGifts();
  // ...остальной код
});
```

### Настройка уведомлений

В Google Apps Script можно настроить отправку уведомлений:
- На email родителей при каждом новом бронировании
- На email человека, делающего бронь (подтверждение)
- В Telegram чат (требует дополнительной настройки)

## Безопасность

- Google Apps Script автоматически обрабатывает CORS
- Данные сохраняются в защищённой Google Таблице
- Доступ к записи данных есть только у владельца скрипта

## Поддержка

При возникновении проблем:
1. Проверьте правильность URL в HTML
2. Убедитесь, что Google Apps Script имеет необходимые разрешения
3. Проверьте логи ошибок в консоли браузера
4. Проверьте логи выполнения в Google Apps Script

## Решение проблем

### Ошибка "Cannot read properties of undefined (reading 'parameter')"

Эта ошибка возникает при обработке POST запросов. Используйте исправленный код из файла `google-script-fixed.js`, который правильно обрабатывает разные типы POST данных.

### Отладка Google Apps Script

1. **Проверка логов**: В Google Apps Script перейдите в раздел "Выполнения" для просмотра логов
2. **Тестирование функций**: Используйте кнопку "Выполнить" для тестирования функций
3. **Проверка разрешений**: Убедитесь, что скрипт имеет доступ к Google Sheets и Gmail

### Проверка работы формы

1. Откройте консоль разработчика в браузере (F12)
2. Попробуйте отправить форму
3. Проверьте вкладку "Network" на наличие ошибок HTTP
4. Проверьте вкладку "Console" на наличие JavaScript ошибок

### Частые проблемы

- **CORS ошибки**: Google Apps Script автоматически обрабатывает CORS для развернутых веб-приложений
- **Неправильный URL**: Убедитесь, что используете URL веб-приложения, а не URL редактора скрипта
- **Разрешения**: При первом запуске обязательно предоставьте все необходимые разрешения
