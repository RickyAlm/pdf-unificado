export function previewPDF(pdfBytes) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const win = window.open(url, '_blank');
  
  if (!win || win.closed || typeof win.closed === 'undefined') {
    Swal.fire({
      title: 'Visualização do PDF',
      html: `<iframe src="${url}" style="width:100%; height:70vh; border:none;"></iframe>`,
      width: '80%',
      showConfirmButton: false,
      showCloseButton: true
    });
  }

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}