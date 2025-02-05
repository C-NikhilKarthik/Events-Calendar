import { useState, useRef, useEffect } from "react";
import { getMonthDays } from "../utils/dateUtils";
import PropTypes from "prop-types";

CalendarBody.propTypes = {
    currentDate: PropTypes.instanceOf(Date).isRequired,
};

function getRandomColor() {
    // Return a random hex color string.
    return (
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
    );
}

function formatTime(left) {
    // Each pixel corresponds to 20 minutes.
    const totalMinutes = Math.round(left * 20);
    const hours = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export default function CalendarBody({ currentDate }) {
    const days = getMonthDays(currentDate);
    const rowHeight = 60; // Each resource row is 60px high.

    // Build a month key (e.g., "2025-02")
    const monthKey = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // Data persistence states.
    const [events, setEvents] = useState(localStorage.getItem("calendarData")[monthKey]?.events || []);
    const [resourceCount, setResourceCount] = useState(15);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Event creation states.
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);

    // Moving/resizing states.
    const [movingEvent, setMovingEvent] = useState(null);
    const [resizingEvent, setResizingEvent] = useState(null);
    const [hoveredEvent, setHoveredEvent] = useState(null);

    // Create refs for each resource row.
    const containerRefs = useRef([]);

    // ---------------------------  
    // Load/Save Data in localStorage
    // ---------------------------
    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem("calendarData") || "{}");
        if (storedData[monthKey]) {
            setEvents(storedData[monthKey]?.events || []);
            setResourceCount(storedData[monthKey]?.resources || 15);
        } else {
            setEvents([]);
            setResourceCount(15);
        }
        setHasLoaded(true);
    }, [monthKey]);

    useEffect(() => {
        if (!hasLoaded) return;
        const storedData = JSON.parse(localStorage.getItem("calendarData") || "{}");
        storedData[monthKey] = { events, resources: resourceCount };
        localStorage.setItem("calendarData", JSON.stringify(storedData));
    }, [events, resourceCount, monthKey, hasLoaded]);

    // Listen for the custom "addResource" event dispatched from the header.
    useEffect(() => {
        const handleAddResourceEvent = (e) => {
            if (e.detail.monthKey === monthKey) {
                setResourceCount((prev) => prev + 1);
            }
        };

        window.addEventListener("addResource", handleAddResourceEvent);

        return () => {
            window.removeEventListener("addResource", handleAddResourceEvent);
        };
    }, [monthKey]);

    // ---------------------------
    // New Event Creation Handlers
    // ---------------------------
    const handleNewMouseDown = (resourceIndex, e) => {
        // Only start a new event if clicking on an empty area.
        if (e.target !== e.currentTarget) return;
        const containerLeft =
            containerRefs.current[resourceIndex].getBoundingClientRect().left;
        setIsDragging(true);
        setDragStart({ resourceIndex, clientX: e.clientX, containerLeft });
        setDragEnd({ resourceIndex, clientX: e.clientX, containerLeft });
    };

    const handleNewMouseMove = (resourceIndex, e) => {
        if (isDragging) {
            const containerLeft =
                containerRefs.current[resourceIndex].getBoundingClientRect().left;
            setDragEnd({ resourceIndex, clientX: e.clientX, containerLeft });
        }
    };

    const handleNewMouseUp = () => {
        if (isDragging && dragStart && dragEnd) {
            const left =
                Math.min(dragStart.clientX, dragEnd.clientX) - dragStart.containerLeft;
            const width = Math.abs(dragEnd.clientX - dragStart.clientX);
            if (width > 4) {
                const newEvent = {
                    id: Date.now(),
                    resourceIndex: dragStart.resourceIndex,
                    left,
                    width,
                    color: getRandomColor(),
                };
                setEvents((prev) => [...prev, newEvent]);
            }
        }
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    };

    const handleDeleteEvent = (e, eventId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this event?")) {
            setEvents((prevEvents) => prevEvents.filter((ev) => ev.id !== eventId));
        }
    };

    // ---------------------------
    // Moving an Existing Event
    // ---------------------------
    const handleEventMouseDown = (e, eventItem) => {
        e.stopPropagation();
        setMovingEvent({
            id: eventItem.id,
            initialX: e.clientX,
            initialY: e.clientY,
            originalLeft: eventItem.left,
            originalResource: eventItem.resourceIndex,
            width: eventItem.width,
            color: eventItem.color,
            newLeft: eventItem.left,
            currentResource: eventItem.resourceIndex,
        });
    };

    useEffect(() => {
        if (movingEvent) {
            const handleMouseMoveEvent = (e) => {
                const dx = e.clientX - movingEvent.initialX;
                const dy = e.clientY - movingEvent.initialY;
                const newLeft = movingEvent.originalLeft + dx;
                const rowDelta = Math.round(dy / rowHeight);
                let newResource = movingEvent.originalResource + rowDelta;
                newResource = Math.max(0, Math.min(resourceCount - 1, newResource));
                setMovingEvent((prev) => ({
                    ...prev,
                    newLeft,
                    currentResource: newResource,
                }));
            };

            const handleMouseUpEvent = () => {
                if (movingEvent) {
                    setEvents((prev) =>
                        prev.map((ev) =>
                            ev.id === movingEvent.id
                                ? {
                                    ...ev,
                                    left: movingEvent.newLeft,
                                    resourceIndex: movingEvent.currentResource,
                                }
                                : ev
                        )
                    );
                    setMovingEvent(null);
                }
            };

            window.addEventListener("mousemove", handleMouseMoveEvent);
            window.addEventListener("mouseup", handleMouseUpEvent);
            return () => {
                window.removeEventListener("mousemove", handleMouseMoveEvent);
                window.removeEventListener("mouseup", handleMouseUpEvent);
            };
        }
    }, [movingEvent, resourceCount, rowHeight]);

    // ---------------------------
    // Resizing an Event
    // ---------------------------
    const handleResizerMouseDown = (e, eventItem) => {
        e.stopPropagation();
        setResizingEvent({
            id: eventItem.id,
            initialX: e.clientX,
            originalWidth: eventItem.width,
            resourceIndex: eventItem.resourceIndex,
            left: eventItem.left,
            color: eventItem.color,
        });
    };

    useEffect(() => {
        if (resizingEvent) {
            const handleResizerMouseMove = (e) => {
                const dx = e.clientX - resizingEvent.initialX;
                const newWidth = Math.max(10, resizingEvent.originalWidth + dx);
                setResizingEvent((prev) => ({ ...prev, newWidth }));
            };

            const handleResizerMouseUp = () => {
                if (resizingEvent) {
                    setEvents((prev) =>
                        prev.map((ev) =>
                            ev.id === resizingEvent.id
                                ? { ...ev, width: resizingEvent.newWidth || ev.width }
                                : ev
                        )
                    );
                    setResizingEvent(null);
                }
            };

            window.addEventListener("mousemove", handleResizerMouseMove);
            window.addEventListener("mouseup", handleResizerMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleResizerMouseMove);
                window.removeEventListener("mouseup", handleResizerMouseUp);
            };
        }
    }, [resizingEvent]);

    return (
        <div className="relative overflow-auto flex flex-col flex-1">
            {/* Calendar Grid Header */}
            <div className="sticky top-0 z-[6] flex text-sm bg-white">
                <div className="flex-none w-48 border border-primary border-l-0 sticky left-0 bg-white" />
                {days.map((d, index) => {
                    // Determine if this cell's date matches today's date.
                    const today = new Date();
                    const isToday =
                        today.getFullYear() === currentDate.getFullYear() &&
                        today.getMonth() === currentDate.getMonth() &&
                        today.getDate() === d.date; // Assumes d.date is the day number

                    return (
                        <div
                            key={index}
                            className={`flex-none w-16 border border-primary border-l-0 p-1 text-center ${isToday ? "bg-blue-500 text-white" : ""
                                }`}
                        >
                            {d.date} {d.day}
                        </div>
                    );
                })}
            </div>

            {/* Calendar Grid Body */}
            <div className="flex flex-1 relative">
                {/* Sticky Resource Names */}
                <div className="sticky left-0 z-[5] bg-white">
                    {Array.from({ length: resourceCount }).map((_, index) => (
                        <div
                            key={index}
                            className="w-48 border border-primary border-t-0 border-l-0 p-1 min-h-[60px]"
                        >
                            Resource {index + 1}
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="relative flex-1">
                    {Array.from({ length: resourceCount }).map((_, resourceIndex) => (
                        <div
                            key={resourceIndex}
                            ref={(el) => (containerRefs.current[resourceIndex] = el)}
                            className="relative"
                            onMouseDown={(e) => handleNewMouseDown(resourceIndex, e)}
                            onMouseMove={(e) =>
                                isDragging && handleNewMouseMove(resourceIndex, e)
                            }
                            onMouseUp={handleNewMouseUp}
                            onMouseLeave={handleNewMouseUp}
                        >
                            {/* Grid Cells */}
                            <div className="flex w-full min-h-[60px] pointer-events-none">
                                {days.map((d, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="w-16 border border-primary border-l-0 border-t-0 p-1"
                                    />
                                ))}
                            </div>

                            {/* Render Events */}
                            <div className="absolute top-0 left-0 w-full h-full z-[4] pointer-events-none">
                                {events
                                    .filter((event) => event.resourceIndex === resourceIndex)
                                    .map((event) =>
                                        movingEvent && movingEvent.id === event.id
                                            ? null
                                            : resizingEvent && resizingEvent.id === event.id
                                                ? null
                                                : (
                                                    <div
                                                        key={event.id}
                                                        onMouseDown={(e) => handleEventMouseDown(e, event)}
                                                        onMouseEnter={() => setHoveredEvent(event.id)}
                                                        onMouseLeave={() => setHoveredEvent(null)}
                                                        className="absolute cursor-move text-xs p-1 rounded transition duration-150"
                                                        style={{
                                                            left: `${event.left}px`,
                                                            width: `${event.width}px`,
                                                            height: "40px",
                                                            backgroundColor: event.color,
                                                            opacity: hoveredEvent === event.id ? 1 : 0.5,
                                                            border: hoveredEvent === event.id ? "2px solid #1d4ed8" : "none",
                                                            pointerEvents: "auto",
                                                        }}
                                                    >
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log("Delete event", event.id);
                                                                handleDeleteEvent(e, event.id);
                                                            }}
                                                            className="absolute top-1 right-1 z-10 cursor-pointer px-1"
                                                        >
                                                            X
                                                        </span>
                                                        <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                                                            New Event
                                                        </div>
                                                        <div className="text-[10px] text-ellipsis overflow-hidden whitespace-nowrap">
                                                            {formatTime(event.left)} - {formatTime(event.left + event.width)}
                                                        </div>
                                                        {/* Resizer handle */}
                                                        <div
                                                            onMouseDown={(e) => handleResizerMouseDown(e, event)}
                                                            className="absolute right-0 top-0 h-full w-3 cursor-ew-resize"
                                                        ></div>
                                                    </div>
                                                )
                                    )}

                                {/* New Event Preview */}
                                {isDragging &&
                                    dragStart &&
                                    dragEnd &&
                                    dragStart.resourceIndex === resourceIndex && (
                                        <div
                                            className="absolute bg-blue-300 opacity-50 text-white text-xs p-1 rounded pointer-events-none"
                                            style={{
                                                left: `${Math.min(dragStart.clientX, dragEnd.clientX) -
                                                    dragStart.containerLeft
                                                    }px`,
                                                width: `${Math.abs(dragEnd.clientX - dragStart.clientX)}px`,
                                                height: "40px",
                                            }}
                                        >
                                            Dragging...
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}

                    {/* Floating Moving Event */}
                    {movingEvent && (
                        <div
                            className="absolute cursor-move text-xs p-1 rounded transition duration-150 z-[20]"
                            style={{
                                left: `${movingEvent.newLeft}px`,
                                top: `${movingEvent.currentResource * rowHeight}px`,
                                width: `${movingEvent.width}px`,
                                height: "40px",
                                backgroundColor: movingEvent.color,
                                opacity: 1,
                                border: "2px solid #1d4ed8",
                                pointerEvents: "auto",
                            }}
                        >   <div className="text-ellipsis overflow-hidden whitespace-nowrap">New Event</div>
                            <div className="text-[10px] text-ellipsis overflow-hidden whitespace-nowrap">

                                {formatTime(movingEvent.newLeft)} - {formatTime(movingEvent.newLeft + movingEvent.width)}
                            </div>
                        </div>
                    )}

                    {/* Floating Resizing Event */}
                    {resizingEvent && (
                        <div
                            className="absolute cursor-ew-resize text-xs p-1 rounded transition duration-150 z-[20]"
                            style={{
                                left: `${resizingEvent.left}px`,
                                top: `${resizingEvent.resourceIndex * rowHeight}px`,
                                width: `${resizingEvent.newWidth || resizingEvent.originalWidth}px`,
                                height: "40px",
                                backgroundColor: resizingEvent.color,
                                opacity: 1,
                                border: "2px solid #1d4ed8",
                                pointerEvents: "auto",
                            }}
                        >
                            Start: {formatTime(resizingEvent.left)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}