import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';
import { BarLoader } from "react-spinners";

const WriteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex items-center space-x-2 mb-4"> {/* Add flex and space between icon and text */}
        <Link
          href="/dashboard"
          className="text-sm text-orange-600 hover:text-orange-700 cursor-pointer flex items-center"
        >
          <ArrowLeft className="mr-2" /> 
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <Suspense fallback={<BarLoader color="orange" width={"100%"}/>}>
        {children}
      </Suspense>
    </div>
  );
};

export default WriteLayout;
