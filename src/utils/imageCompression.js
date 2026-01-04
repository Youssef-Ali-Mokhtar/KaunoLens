// utils/imageCompression.js

export function compressImage(
  file,
  {
    maxWidth = 800,
    quality = 0.5,
    outputType = "image/jpeg",
  } = {}
) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided")
      return
    }

    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e) => {
      img.src = e.target.result
    }

    reader.onerror = () => reject("File reading failed")

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement("canvas")

      canvas.width = img.width * scale
      canvas.height = img.height * scale

      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const compressedBase64 = canvas.toDataURL(outputType, quality)
      resolve(compressedBase64)
    }

    img.onerror = () => reject("Image loading failed")

    reader.readAsDataURL(file)
  })
}
