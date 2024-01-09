import { useEffect, useState } from "react";

export const useRefresh = () => {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefresh(refresh + 1);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  });

  return refresh;
};

export const useSlowRefresh = () => {
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefresh(refresh + 1);
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  });

  return refresh;
};
