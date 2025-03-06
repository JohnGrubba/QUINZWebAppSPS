"use server"

export async function proxyRequest(url: string, init: RequestInit) {
    try {
        const response = await fetch(url, init);
        const data = await response.json();
        console.log(data)
        return data;
    } catch (e) {
        return undefined
    }
}