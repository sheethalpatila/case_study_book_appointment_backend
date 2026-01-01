exports.minutesDiff = (date) =>
  (new Date(date).getTime() - Date.now()) / 60000;