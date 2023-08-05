export const fileNameHandler = (fullName: string = '', fileOriginName: string = '') => {
  if (fullName.startsWith('/')) {
    // "/202307/28/readme.md" -> "2023/07/28/readme.md"
    fullName = fullName.slice(1)
  }

  if (fullName === '') {
    let suffix = ''
    if (fileOriginName.includes('.')) {
      suffix = fileOriginName.substring(fileOriginName.lastIndexOf('.') + 1)
    }
    const { year, month, day, hours, minutes, seconds, milliseconds } = currentTime()
    if (suffix === '') {
      fullName = `${year}/${month}/${day}/${hours}${minutes}${seconds}${milliseconds}`
    } else {
      fullName = `${year}/${month}/${day}/${hours}${minutes}${seconds}${milliseconds}.${suffix}`
    }
  }
  return { _fullName: fullName }
}

const currentTime = () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentDate.getDate().toString().padStart(2, '0')
  const hours = currentDate.getHours().toString().padStart(2, '0')
  const minutes = currentDate.getMinutes().toString().padStart(2, '0')
  const seconds = currentDate.getSeconds().toString().padStart(2, '0')
  const milliseconds = currentDate.getMilliseconds().toString().padStart(3, '0')
  return { year, month, day, hours, minutes, seconds, milliseconds }
}
