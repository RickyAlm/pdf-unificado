export function validateFileName(name) {
  const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
  return !invalidChars.some(char => name.includes(char));
}

export function formatFileName(name) {
  if (!name) return "pdf_unificado.pdf";
  if (!name.toLowerCase().endsWith('.pdf')) return name + '.pdf';
  return name;
}