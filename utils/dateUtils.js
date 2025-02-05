export const getMonthDays = (date) => {
    if (!date) {
        throw new Error("Invalid date");
    }
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
            day: new Date(year, month, i).toLocaleString("default", { weekday: "short" }),
            date: i,
            month: month + 1,
            year: year
        });
    }

    return days;
};
export const getMonthName = (date) => {
    return date.toLocaleString("default", { month: "long" })
}

export const isSameDay = (date1, date2) => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    )
}

