import React from 'react'

type AuthlayoutProps = {
    children: React.ReactNode
}

const Authlayout = ({children}:AuthlayoutProps) => {
  return (
    <div className='flex justify-center pt-20'>
        {children}
    </div>
  )
}

export default Authlayout