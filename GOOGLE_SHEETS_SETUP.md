# Google Sheets Product Updates

Use this when the seller does not want to edit website code.

## 1. Create the sheet

Create a Google Sheet with exactly these columns in row 1:

```text
Code,Name,Category,Color,Price,Sizes,Stock,StockCount,SizeStock,Photo
```

Example rows:

```text
D001,Floral Kurti,kurti,Pink,899,"S,M,L",available,5,"S:2,M:2,L:1",https://example.com/dress-photo.jpg
D002,Party Gown,party,Blue,1299,"M,L",sold out,0,"M:0,L:0",https://example.com/gown-photo.jpg
D003,Linen Pants,pant,Black,699,,available,3,,https://example.com/pants-photo.jpg
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
- Leave `Sizes` blank if the item has no size choice. The website will not show "Free Size".
- Change `Category` to control the filter buttons. If you add `pant`, the website shows a Pant filter. If no products use a category, that filter disappears.
- Change `Stock` to `available`, `sold out`, or `hide`. If your sheet says `Stocks`, the website also accepts that.
- Change `StockCount` to show how many pieces are available. Example: `5` shows "5 in stock".
- Change `SizeStock` for size-wise stock. Example: `S:2,M:3,L:1`. The website limits quantity based on the selected size.
- If `SizeStock` is filled, `StockCount` can be the total stock or left blank. If the item has no size choice, use only `StockCount`.
- Add a new row to add a new dress.
- Delete a row or set `Stock` to `hide` to remove a dress.

Photos should be direct public image links. If the photo cell is empty, the website shows a simple dress placeholder.
