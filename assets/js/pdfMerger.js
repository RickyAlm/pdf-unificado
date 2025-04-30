import { addPageNumbers } from './pagination.js';
import { validateFileName, formatFileName } from './utils.js';
import { previewPDF } from './pdfViewer.js';

export function initPDFMerger(pdfInput, mergeBtn) {
  window.mergePDFs = async function() {
    const inputFiles = pdfInput.files;
    const pdfNameInput = document.getElementById('pdfName');
    const paginateToggle = document.getElementById('paginateToggle');
    const paginateFirstPage = document.getElementById('paginateFirstPage');

    if (!validateFileName(pdfNameInput.value.trim())) {
      showInvalidNameAlert();
      return;
    }

    const pdfName = formatFileName(pdfNameInput.value.trim());

    if (inputFiles.length < 1) {
      showNoFilesAlert();
      return;
    }

    try {
      showProcessingAlert();

      const { mergedPdfBytes, totalPages } = await processPDFs(
        inputFiles,
        paginateToggle.checked,
        paginateFirstPage.checked
      );

      showSuccessAlert(inputFiles.length, totalPages, mergedPdfBytes, pdfName);
    } catch (error) {
      handleMergeError(error);
    }
  };

  async function processPDFs(files, shouldPaginate, shouldPaginateFirstPage) {
    const mergedPdf = await PDFLib.PDFDocument.create();
    let currentPageNumber = 0;
    let totalPages = 0;

    const font = await loadFont(mergedPdf);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      if (i === 0) {
        totalPages = await calculateTotalPages(files, pages.length);
      }

      for (const [index, page] of pages.entries()) {
        currentPageNumber++;
        const newPage = mergedPdf.addPage(page);

        if (shouldPaginate) {
          addPageNumbers(newPage, currentPageNumber, totalPages, shouldPaginateFirstPage, font);
        }
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    return { mergedPdfBytes, totalPages };
  }

  async function calculateTotalPages(files, firstFilePages) {
    let total = firstFilePages;
    for (let j = 1; j < files.length; j++) {
      const tempFile = files[j];
      const tempArrayBuffer = await tempFile.arrayBuffer();
      const tempPdfDoc = await PDFLib.PDFDocument.load(tempArrayBuffer);
      total += tempPdfDoc.getPageCount();
    }
    return total;
  }

  async function loadFont(pdfDocument) {
    try {
      const fontBytes = await fetch('assets/fonts/CenturyGothic/centurygothic.ttf')
        .then(res => res.arrayBuffer());
      return await pdfDocument.embedFont(fontBytes);
    } catch {
      console.warn('Fonte Century Gothic não encontrada, usando Helvetica como fallback');
      return await pdfDocument.embedFont(PDFLib.StandardFonts.Helvetica);
    }
  }

  function showInvalidNameAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Nome inválido',
      text: 'O nome não pode conter: / \\ : * ? " < > |',
      confirmButtonColor: '#0d6efd'
    });
  }

  function showNoFilesAlert() {
    Swal.fire({
      icon: 'warning',
      title: 'Oops...',
      text: 'Selecione pelo menos um arquivo PDF!',
      confirmButtonColor: '#0d6efd'
    });
  }

  function showProcessingAlert() {
    Swal.fire({
      title: 'Processando...',
      html: 'Unificando seus arquivos PDF. Por favor, aguarde.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  function showSuccessAlert(fileCount, pageCount, pdfBytes, pdfName) {
    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Pronto!',
      html: `Seu PDF com ${fileCount} arquivo(s) unificado(s) e ${pageCount} páginas está pronto.<br><br>
            <div class="d-flex justify-content-center gap-2">
              <button id="previewBtn" class="btn btn-outline-primary">
                <i class="fas fa-eye me-2"></i>Visualizar
              </button>
            </div>`,
      confirmButtonColor: '#198754',
      confirmButtonText: '<i class="fas fa-download me-2"></i>Download',
      showCancelButton: true,
      cancelButtonText: 'Fechar',
      didOpen: () => {
        document.getElementById('previewBtn').addEventListener('click', () => {
          previewPDF(pdfBytes);
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        download(pdfBytes, pdfName, "application/pdf");
      }
    });
  }

  function handleMergeError(error) {
    console.error('Erro ao unificar PDFs:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao processar os arquivos. Verifique se todos são PDFs válidos.',
      confirmButtonColor: '#0d6efd'
    });
  }
}