import React from 'react';
import { server } from '../redux/store';

type ShowDetailsProps = {
  setShowDetails: any;
  showDetail: any;
};

const ShowDetails: React.FC<ShowDetailsProps> = ({ setShowDetails, showDetail }) => {

  return (
    <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 bg-opacity-75'>
    <div className='bg-white p-8 rounded-md w-full md:w-3/4 lg:w-1/2 xl:w-1/3'>
      <h1 className='text-3xl font-bold mb-4'>Order Details</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 lg:px-6 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-2 lg:px-6 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-2 lg:px-6 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:flex md:flex">Image</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {showDetail.orderItems && showDetail?.orderItems?.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-2 lg:px-6 md:px-6 py-4 whitespace-nowrap">{i.name}</td>
                <td className="px-2 lg:px-6 md:px-6 py-4 whitespace-nowrap">{i.price}</td>
                <td className="px-2 lg:px-6 md:px-6 py-4 whitespace-nowrap">{i.quantity}</td>
                <td className="hidden lg:flex md:flex px-6 py-4 whitespace-nowrap"><img src={`${server}/${i.photo}`} className="w-20 h-20 object-cover" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex items-end justify-end mt-10'>
        <button className='px-4 py-2 bg-red-500 hover:bg-red-800 text-white rounded-md' onClick={() => setShowDetails(undefined)}>Close</button>
      </div>
    </div>
  </div>
  
  );
}

export default ShowDetails;
