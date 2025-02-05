import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { getMonthName } from "../utils/dateUtils";
import PropTypes from "prop-types";

CalendarHeader.propTypes = {
    currentDate: PropTypes.instanceOf(Date).isRequired,
    setCurrentDate: PropTypes.func.isRequired,
};

export default function CalendarHeader({ currentDate, setCurrentDate }) {
    const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    const handlePreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Dispatch a global custom event when Add Resource is clicked.
    const handleAddResource = () => {
        window.dispatchEvent(
            new CustomEvent("addResource", { detail: { monthKey } })
        );
    };

    return (
        <div className="px-4 flex-none py-2 justify-between flex items-center">
            <div className="flex items-center gap-4">
                <FaAngleLeft onClick={handlePreviousMonth} className="cursor-pointer" />
                <div className="text-xl">
                    {getMonthName(currentDate)} {currentDate.getFullYear()}
                </div>
                <FaAngleRight onClick={handleNextMonth} className="cursor-pointer" />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleToday}
                    className="px-3 py-1 border rounded hover:bg-gray-200 transition"
                >
                    Today
                </button>
                {/* Add Resource button placed in the header */}
                <button
                    onClick={handleAddResource}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    Add Resource
                </button>
            </div>
        </div>
    );
}