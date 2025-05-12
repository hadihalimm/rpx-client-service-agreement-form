import { useState } from 'react';

export function useFileInput() {
  const [file, setFile] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setTouched(true);
  };

  const isValid = () => !!file;

  return {
    file,
    touched,
    handleChange,
    isValid,
    markTouched: () => setTouched(true),
  };
}
