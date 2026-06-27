# Google Sheets Product Updates

Use this when the seller does not want to edit website code.

## 1. Create the sheet

Create a Google Sheet with exactly these columns in row 1:

```text
Code,Name,Category,Color,Price,Sizes,Stock,Photo
```

Example rows:

```text
D001,Floral Kurti,kurti,Pink,899,"S,M,L",available,https://example.com/dress-photo.jpg
D002,Party Gown,party,Blue,1299,"M,L",sold out,https://example.com/gown-photo.jpg
```

## 2. Publish as CSV

In Google Sheets:

1. Go to File > Share > Publish to web.
2. Choose the product sheet.
3. Choose Comma-separated values (.csv).
4. Click Publish.
5. Copy the CSV link.

## 3. Paste the link into the website

Open `script.js` and paste the CSV link here:

```js
const googleSheetCsvUrl = "";
```

Example:

```js
const googleSheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv";
```

## Seller daily use

The seller only edits Google Sheets:

- Change `Price` to update price.
- Change `Sizes` to update available sizes.
- Change `Stock` to `available`, `sold out`, or `hide`.
- Add a new row to add a new dress.
- Delete a row or set `Stock` to `hide` to remove a dress.

Photos should be direct public image links. If the photo cell is empty, the website shows a simple dress placeholder.
