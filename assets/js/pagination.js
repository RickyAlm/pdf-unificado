export function initPagination() {
  const paginateToggle = document.getElementById('paginateToggle');
  const paginateFirstPage = document.getElementById('paginateFirstPage');

  paginateToggle.addEventListener('change', function() {
    if (!this.checked) {
      paginateFirstPage.checked = false;
      paginateFirstPage.disabled = true;
    } else {
      paginateFirstPage.checked = true;
      paginateFirstPage.disabled = false;
    }
  });

  paginateFirstPage.disabled = !paginateToggle.checked;
}

export function addPageNumbers(page, currentPageNumber, totalPages, shouldPaginateFirstPage, font) {
  const { width, height } = page.getSize();

  if (!shouldPaginateFirstPage && currentPageNumber === 1) {
    return;
  }

  const displayPageNumber = !shouldPaginateFirstPage ? currentPageNumber - 1 : currentPageNumber;
  const displayTotalPages = !shouldPaginateFirstPage ? totalPages - 1 : totalPages;

  if (displayPageNumber < 10) {
    page.drawText(`${displayPageNumber}`, {
      x: width - 77,
      y: height - 102,
      size: 36,
      color: PDFLib.rgb(0, 0, 0),
      rotate: PDFLib.degrees(90),
      font
    });
  } else {
    page.drawText(`${displayPageNumber}`, {
      x: width - 77,
      y: height - 106,
      size: 36,
      color: PDFLib.rgb(0, 0, 0),
      rotate: PDFLib.degrees(90),
      font
    });
  } 

  if (displayTotalPages < 10) {
    page.drawText(`${displayTotalPages}`, {
      x: width - 40,
      y: height - 59,
      size: 36,
      color: PDFLib.rgb(0, 0, 0),
      rotate: PDFLib.degrees(90),
      font
    });
  } else {
    page.drawText(`${displayTotalPages}`, {
      x: width - 38,
      y: height - 72,
      size: 36,
      color: PDFLib.rgb(0, 0, 0),
      rotate: PDFLib.degrees(90),
      font
    });
  }
}