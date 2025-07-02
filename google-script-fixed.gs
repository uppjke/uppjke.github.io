// Google Apps Script код для обработки бронирований
// Этот код нужно разместить в Google Apps Script и подключить к Google Таблице

function doPost(e) {
  try {
    // ID вашей Google Таблицы (найдете в URL таблицы)
    const SPREADSHEET_ID = '1yDKAVW0Rli6rlvm7BQNE933kDcz_x6CO60NnkyMIS0A';
    const SHEET_NAME = 'Бронирования';
    
    // Логируем полученные данные для отладки
    console.log('Полученный объект e:', e ? JSON.stringify(e) : 'undefined');
    
    // Проверяем, что объект e существует
    if (!e) {
      throw new Error('Объект события не определен - функция должна вызываться через HTTP POST запрос');
    }
    
    console.log('e.parameter:', e.parameter);
    console.log('e.postData:', e.postData);
    
    // Получаем данные из POST запроса
    let formData = {};
    
    // Проверяем тип запроса и извлекаем данные соответственно
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Стандартные POST параметры (это основной путь для FormData)
      formData = e.parameter;
      console.log('Используем e.parameter:', formData);
    } else if (e.postData && e.postData.contents) {
      console.log('Используем e.postData.contents:', e.postData.contents);
      console.log('Content-Type:', e.postData.type);
      
      if (e.postData.type === 'application/x-www-form-urlencoded') {
        // URL-encoded данные
        const params = new URLSearchParams(e.postData.contents);
        for (const [key, value] of params) {
          formData[key] = value;
        }
      } else {
        // Другие типы POST данных
        try {
          // Пробуем парсить как JSON
          formData = JSON.parse(e.postData.contents);
        } catch (jsonError) {
          // Если не JSON, пробуем как URL-encoded
          const params = new URLSearchParams(e.postData.contents);
          for (const [key, value] of params) {
            formData[key] = value;
          }
        }
      }
    } else {
      console.log('Нет данных в запросе. e.parameter:', e.parameter, 'e.postData:', e.postData);
      throw new Error('Не удалось извлечь данные из запроса');
    }
    
    console.log('Извлеченные данные формы:', formData);
    
    // Открываем таблицу
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Если лист не существует, создаем его
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Добавляем заголовки
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Дата/Время', 'Подарок', 'Имя', 'Телефон', 'Email', 'Сообщение'
      ]]);
      
      // Форматируем заголовки
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#667eea');
      headerRange.setFontColor('#ffffff');
    }
    
    // Подготавливаем данные для записи
    const timestamp = new Date().toLocaleString('ru-RU');
    const rowData = [
      timestamp,
      formData.giftName || '',
      formData.userName || '',
      formData.userPhone || '',
      formData.userEmail || '',
      formData.userMessage || ''
    ];
    
    // Добавляем новую строку
    sheet.appendRow(rowData);
    
    // Отправляем уведомление на email (опционально)
    sendNotificationEmail(formData);
    
    // Возвращаем успешный ответ
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Бронирование успешно сохранено'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Ошибка:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Произошла ошибка при сохранении: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotificationEmail(formData) {
  try {
    // Email для уведомлений (замените на свой)
    const NOTIFICATION_EMAIL = 'uppjke@gmail.com';
    
    const subject = `Новое бронирование: ${formData.giftName}`;
    const body = `
Поступило новое бронирование подарка!

Подарок: ${formData.giftName}
Имя: ${formData.userName}
Телефон: ${formData.userPhone}
Email: ${formData.userEmail}
Сообщение: ${formData.userMessage}

Дата: ${new Date().toLocaleString('ru-RU')}
    `;
    
    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
    
  } catch (error) {
    console.error('Ошибка отправки email:', error);
  }
}

// Функция для получения списка забронированных подарков
function doGet(e) {
  try {
    const SPREADSHEET_ID = '1yDKAVW0Rli6rlvm7BQNE933kDcz_x6CO60NnkyMIS0A';
    const SHEET_NAME = 'Бронирования';
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'success',
          'reservedGifts': []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const reservedGifts = data.slice(1).map(row => row[1]); // Получаем названия подарков
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'reservedGifts': reservedGifts
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Ошибка:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Ошибка получения данных'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Тестовая функция для отладки
function testDoPost() {
  // Имитируем POST запрос для тестирования
  const testEvent = {
    parameter: {
      giftName: 'Тестовый подарок',
      userName: 'Тест Тестович',
      userPhone: '+7 900 000-00-00',
      userEmail: 'test@example.com',
      userMessage: 'Тестовое сообщение'
    }
  };
  
  console.log('Запуск тестовой функции с данными:', testEvent);
  
  const result = doPost(testEvent);
  console.log('Результат теста:', result.getContent());
  return result;
}

// Дополнительная тестовая функция для проверки самой таблицы
function testSpreadsheet() {
  try {
    const SPREADSHEET_ID = '1yDKAVW0Rli6rlvm7BQNE933kDcz_x6CO60NnkyMIS0A';
    const SHEET_NAME = 'Бронирования';
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('Таблица найдена:', spreadsheet.getName());
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.log('Лист "Бронирования" не найден, создаю...');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Добавляем заголовки
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Дата/Время', 'Подарок', 'Имя', 'Телефон', 'Email', 'Сообщение'
      ]]);
      
      // Форматируем заголовки
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#667eea');
      headerRange.setFontColor('#ffffff');
      
      console.log('Лист создан и заголовки добавлены');
    } else {
      console.log('Лист найден:', sheet.getName());
    }
    
    // Добавляем тестовую запись
    const testData = [
      new Date().toLocaleString('ru-RU'),
      'Тестовый подарок из функции testSpreadsheet',
      'Тест Тестович',
      '+7 900 000-00-00',
      'test@example.com',
      'Тестовое сообщение'
    ];
    
    sheet.appendRow(testData);
    console.log('Тестовая запись добавлена');
    
    return 'Тест успешно завершен';
    
  } catch (error) {
    console.error('Ошибка в тесте таблицы:', error);
    return 'Ошибка: ' + error.toString();
  }
}
