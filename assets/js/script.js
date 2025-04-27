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
    const pdfNameInput = document.getElementById('pdfName');

    let pdfName = pdfNameInput.value.trim();

    if (pdfName.includes('/') || pdfName.includes('\\') || pdfName.includes(':') || 
      pdfName.includes('*') || pdfName.includes('?') || pdfName.includes('"') || 
      pdfName.includes('<') || pdfName.includes('>') || pdfName.includes('|')) {
      Swal.fire({
        icon: 'error',
        title: 'Nome inválido',
        text: 'O nome não pode conter: / \\ : * ? " < > |',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    if (!pdfName) {
      pdfName = "pdf_unificado";
    }

    if (!pdfName.toLowerCase().endsWith('.pdf')) {
      pdfName += '.pdf';
    }

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
      Swal.fire({
        title: 'Processando...',
        html: 'Unificando seus arquivos PDF. Por favor, aguarde.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const mergedPdf = await PDFLib.PDFDocument.create();
      let currentPageNumber = 0;
      let totalPages = 0;

      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

        if (i === 0) {
          totalPages = pages.length;
          for (let j = 1; j < inputFiles.length; j++) {
            const tempFile = inputFiles[j];
            const tempArrayBuffer = await tempFile.arrayBuffer();
            const tempPdfDoc = await PDFLib.PDFDocument.load(tempArrayBuffer);
            totalPages += tempPdfDoc.getPageCount();
          }
        }

        let centuryGothic;

        try {
          const fontBytes = await fetch('assets/fonts/CenturyGothic/centurygothic.ttf').then(res => res.arrayBuffer());
          centuryGothic = await mergedPdf.embedFont(fontBytes);
        } catch {
          console.warn('Fonte Century Gothic não encontrada, usando Helvetica como fallback');
          centuryGothic = await mergedPdf.embedFont(PDFLib.StandardFonts.Helvetica);
        }

        for (const [index, page] of pages.entries()) {
          currentPageNumber++;
          const newPage = mergedPdf.addPage(page);

          const { width, height } = newPage.getSize();

          newPage.drawText(`${currentPageNumber}`, {
            x: width - 77,
            y: height - 106,
            size: 36,
            color: PDFLib.rgb(0, 0, 0),
            rotate: PDFLib.degrees(90),
          });

          newPage.drawText(`${totalPages}`, {
            x: width - 38,
            y: height - 72,
            size: 36,
            color: PDFLib.rgb(0, 0, 0),
            rotate: PDFLib.degrees(90),
          });
        }
      }

      const mergedPdfBytes = await mergedPdf.save();

      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Pronto!',
        text: `Seu PDF com ${inputFiles.length} arquivo(s) unificado(s) e ${totalPages} páginas numeradas está pronto para download.`,
        confirmButtonColor: '#198754',
        confirmButtonText: 'Download',
        showCancelButton: true,
        cancelButtonText: 'Fechar'
      }).then((result) => {
        if (result.isConfirmed) {
          download(mergedPdfBytes, pdfName, "application/pdf");
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