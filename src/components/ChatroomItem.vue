<template>
    <a class="chatroom-item" :href="chatroom.url" @click="onClick">
        <img class="chatroom-item__image" :src="chatroom.image" :alt="chatroom.name" />
        <span class="chatroom-item__name">{{ chatroom.name }}</span>
        <span class="chatroom-item__chevron" aria-hidden="true">›</span>
    </a>
</template>

<script setup>
import { openChatroom } from '@/utils/native.js';

const props = defineProps({
    chatroom: {
        type: Object,
        required: true,
    },
});

// Inside the native app, let it handle the routing. Otherwise (regular browser), follow the link.
function onClick(event) {
    if (openChatroom(props.chatroom)) {
        event.preventDefault();
    }
}
</script>

<style lang="scss" scoped>
.chatroom-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: 16px;
    background: var(--color-surface);
    color: inherit;
    text-decoration: none;
    transition:
        transform 0.15s ease,
        background-color 0.15s ease;

    &:active {
        transform: scale(0.98);
        background: var(--color-surface-active);
    }
}

.chatroom-item__image {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 12px;
    object-fit: cover;
}

.chatroom-item__name {
    flex: 1;
    font-size: 17px;
    font-weight: 600;
}

.chatroom-item__chevron {
    font-size: 24px;
    color: var(--color-text-secondary);
}
</style>
