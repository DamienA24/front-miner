import { useMemo } from "react";
import { getBananaContract } from "../utils/contracts";
import { useSigner } from "./useSigner";

export const useBananaContract = (library) => {
  const signer = useSigner(library);
  return useMemo(() => getBananaContract(signer), [signer]);
};
