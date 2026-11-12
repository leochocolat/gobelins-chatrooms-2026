// Placeholder photos from Unsplash, used when a chatroom has no image (or it fails to load)
const FALLBACK_PHOTOS = [
    '1506744038136-46273834b3fb',
    '1500530855697-b586d89ba3ee',
    '1469474968028-56623f02e42e',
    '1501785888041-af3ef285b470',
    '1470071459604-3b5ec3a7fe05',
    '1441974231531-c6227db76b6e',
    '1507525428034-b723cf961d3e',
    '1518837695005-2083093ee35b',
];

// Always returns the same photo for a given id, so a chatroom keeps its image between launches
export function getFallbackImage(id, width = 900) {
    const hash = [...id].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
    const photo = FALLBACK_PHOTOS[hash % FALLBACK_PHOTOS.length];

    return `https://images.unsplash.com/photo-${photo}?w=${width}&q=80&auto=format&fit=crop`;
}
