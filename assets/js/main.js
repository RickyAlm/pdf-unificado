import { initDragAndDrop } from './dragAndDrop.js';
import { initFileManagement } from './fileManagement.js';
import { initPagination } from './pagination.js';
import { initPDFMerger } from './pdfMerger.js';

(() => {
  const pdfInput = document.getElementById('pdfInput');
  const dropzone = document.getElementById('dropzone');
  const fileNames = document.getElementById('fileNames');
  const mergeBtn = document.getElementById('mergeBtn');

  initDragAndDrop(dropzone, pdfInput, handleFiles);
  initFileManagement(pdfInput, fileNames, mergeBtn);
  initPagination();
  initPDFMerger(pdfInput, mergeBtn);
})();