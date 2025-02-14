import { useState } from "react";
import { toast } from "sonner";

const useFetch = <T,>(cb: (...args: any[]) => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined);  
  const [error, setError] = useState<Error | null>(null);  
  const [loading, setLoading] = useState<boolean>(false);  

  const fn = async (...args: any[]) => {
    setLoading(true);  
    setError(null);    

    try {
      const response = await cb(...args); 
      setData(response);  
    } catch (error: any) {
      setError(error);  
      toast.error(error.message);  
    } finally {
      setLoading(false);  
    }
  };

  return { data, error, loading, fn };
};

export default useFetch;
