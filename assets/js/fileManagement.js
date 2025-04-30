import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@latest/+esm';

export function initFileManagement(pdfInput, fileNames, mergeBtn) {
  let filesArray = [];

  function updateFileNames() {
    fileNames.innerHTML = '';

    filesArray.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.classList.add('sortable-item');
      fileItem.dataset.index = index;
      fileItem.draggable = true;

      fileItem.innerHTML = `
        <span><i class="fas fa-file-pdf text-danger me-2"></i>${file.name}</span>
        <i class="fas fa-trash-alt remove-file" data-index="${index}"></i>
      `;

      fileNames.appendChild(fileItem);
    });

    document.querySelectorAll('.remove-file').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        removeFile(index);
      });
    });

    mergeBtn.disabled = filesArray.length === 0;
  }

  function removeFile(index) {
    filesArray.splice(index, 1);
    syncFileInput();
    updateFileNames();
  }

  function syncFileInput() {
    const dataTransfer = new DataTransfer();
    filesArray.forEach(file => dataTransfer.items.add(file));
    pdfInput.files = dataTransfer.files;
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const newFiles = Array.from(dt.files);
    filesArray.push(...newFiles);
    syncFileInput();
    updateFileNames();
  }

  pdfInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    filesArray.push(...newFiles);
    syncFileInput();
    updateFileNames();
  });

  new Sortable(fileNames, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function(evt) {
      const movedItem = filesArray[evt.oldIndex];
      filesArray.splice(evt.oldIndex, 1);
      filesArray.splice(evt.newIndex, 0, movedItem);
      syncFileInput();
      updateFileNames();
    }
  });

  mergeBtn.disabled = true;
}