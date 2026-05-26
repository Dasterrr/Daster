const SPREADSHEET_ID = "1iRwP1c107v_MvdKUGUssmNEyvJpC42mXdqPVoZ0G_9s";
const SHEET_NAME = "login_log";

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    data.phone || "",
    data.name || "",
    data.device || "",
    data.page || "",
    data.source || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
