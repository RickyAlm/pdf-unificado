(() => {
  // Elementos do DOM
  const pdfInput = document.getElementById('pdfInput');
  const dropzone = document.getElementById('dropzone');
  const fileNames = document.getElementById('fileNames');
  const mergeBtn = document.getElementById('mergeBtn');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropzone.classList.add('active');
  }

  function unhighlight() {
    dropzone.classList.remove('active');
  }

  dropzone.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    pdfInput.files = files;
    updateFileNames();
  }

  pdfInput.addEventListener('change', updateFileNames);

  function updateFileNames() {
    if (pdfInput.files.length > 0) {
      let names = '';
      for (let i = 0; i < pdfInput.files.length; i++) {
        names += `<div class="mb-1"><i class="fas fa-file-pdf text-danger me-2"></i>${pdfInput.files[i].name}</div>`;
      }
      fileNames.innerHTML = names;
      mergeBtn.disabled = false;
    } else {
      fileNames.innerHTML = '';
      mergeBtn.disabled = true;
    }
  }

  window.mergePDFs = async function() {
    const inputFiles = pdfInput.files;

    if (inputFiles.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Selecione pelo menos um arquivo PDF!',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    try {
      // Mostrar loading
      Swal.fire({
        title: 'Processando...',
        html: 'Unificando seus arquivos PDF. Por favor, aguarde.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const mergedPdf = await PDFLib.PDFDocument.create();

      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Pronto!',
        text: `Seu PDF com ${inputFiles.length} arquivo(s) unificado(s) está pronto para download.`,
        confirmButtonColor: '#198754',
        confirmButtonText: 'Download',
        showCancelButton: true,
        cancelButtonText: 'Fechar'
      }).then((result) => {
        if (result.isConfirmed) {
          download(mergedPdfBytes, "pdf_unificado.pdf", "application/pdf");
        }
      });

    } catch (error) {
      console.error('Erro ao unificar PDFs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao processar os arquivos. Verifique se todos são PDFs válidos.',
        confirmButtonColor: '#0d6efd'
      });
    }
  };

  mergeBtn.disabled = true;
})();