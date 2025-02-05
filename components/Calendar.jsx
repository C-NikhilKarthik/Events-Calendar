import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarBody from "./CalendarBody";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="w-screen h-screen overflow-clip flex flex-col">
            <CalendarHeader currentDate={currentDate} setCurrentDate={setCurrentDate} />
            <CalendarBody currentDate={currentDate} />
        </div>
    );
}