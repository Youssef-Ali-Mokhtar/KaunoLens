export async function localizeImage(base64Image) {
  const response = await fetch("http://localhost:8000/api/localize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64Image,
    }),
  });

  if (!response.ok) {
    throw new Error("Localization failed");
  }

  return await response.json();
}
