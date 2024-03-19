import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import TableHOC from "../components/admin/TableHOC";
import { Skeleton } from "../components/loader";
import { useMyOrdersQuery } from "../redux/api/orderAPI";
import { RootState, server } from "../redux/store";
import { CustomError } from "../types/api-types";
import ShowDetails from "../components/ShowDetail";
import axios from "axios";

type DataType = {
  _id: string;
  amount: number;
  quantity: number;
  discount: number;
  status: ReactElement;
  action: ReactElement;
};

const column: Column<DataType>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Orders = () => {
  const { user } = useSelector((state: RootState) => state.userReducer);
  const { isLoading, isError, error } = useMyOrdersQuery(user?._id!);
  const [showDetail, setShowDetails] = useState(undefined);
  const [rows, setRows] = useState<DataType[]>([]);

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message);
  }

  const getOrders = async () => {
    try {
      const { data } = await axios.get(
        `${server}/api/v1/order/my?id=${user?._id}`
      );
      if (data) {
        setRows(
          data.orders.map((i) => ({
            _id: i._id,
            amount: i.total,
            discount: i.discount,
            quantity: i.orderItems.length,
            status: (
              <span
                className={
                  i.status === "Processing"
                    ? "red"
                    : i.status === "Shipped"
                    ? "green"
                    : "purple"
                }
              >
                {i.status}
              </span>
            ),
            action: user?.role === "admin" ? (
              <Link to={`/admin/transaction/${i._id}`}>Manage</Link>
            ) : (
              <button
                className=" text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowDetails(i)}
              >
                Details
              </button>
            ),
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const Table = TableHOC<DataType>(
    column,
    rows,
    "dashboard-product-box",
    "Orders",
    rows.length > 6
  )();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {isLoading ? (
        <Skeleton length={20} />
      ) : (
        <div className="overflow-x-auto">
          {Table}
          {showDetail && (
            <ShowDetails setShowDetails={setShowDetails} showDetail={showDetail} />
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;