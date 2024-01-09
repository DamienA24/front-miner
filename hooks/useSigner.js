import { useEffect, useState } from "react";

export const useSigner = (library) => {
  const [signer, setSigner] = useState();
  useEffect(() => {
    if (library) {
      setSigner(library.getSigner());
    } else {
      setSigner(undefined);
    }
  }, [library]);

  return signer;
};
