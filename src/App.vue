<template>
    <div class="backdrop" aria-hidden="true"></div>

    <div class="root">
        <h1 class="title">
            <span>Gobelins</span>
            <span>Chatrooms 2026</span>
        </h1>

        <ul class="chatroom-list">
            <li v-for="chatroom in chatrooms" :key="chatroom.id">
                <ChatroomItem :chatroom="chatroom" :remember="remember" />
            </li>
        </ul>

        <label class="remember">
            <span class="remember__text">
                <span class="remember__label">Don't show this next time</span>
                <span class="remember__hint">Opens the chosen chatroom directly on next launch</span>
            </span>
            <input v-model="remember" class="remember__switch" type="checkbox" role="switch" />
        </label>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import chatrooms from '@/config/chatrooms.json';
import ChatroomItem from 'components/ChatroomItem.vue';

const remember = ref(false);
</script>

<style lang="scss" scoped>
// Light grey fading into black
.backdrop {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: linear-gradient(180deg, #8c8c8c 0%, #2e2e2e 45%, var(--color-black) 85%);

    // Graph paper grid: fine cells, with a stronger line every 5 cells
    &::after {
        --cell: 8px;
        --major: calc(var(--cell) * 5);
        --minor-line: rgba(255, 255, 255, 0.035);
        --major-line: rgba(255, 255, 255, 0.07);

        content: '';
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(to right, var(--major-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--major-line) 1px, transparent 1px),
            linear-gradient(to right, var(--minor-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--minor-line) 1px, transparent 1px);
        background-size:
            var(--major) var(--major),
            var(--major) var(--major),
            var(--cell) var(--cell),
            var(--cell) var(--cell);
    }
}


.root {
    position: relative;
    max-width: 1120px;
    margin: 0 auto;
    padding: calc(56px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right))
        calc(40px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left));
}

.title {
    display: flex;
    flex-direction: column;
    margin: 0 0 48px;
    font-family: var(--font-display);
    font-size: clamp(44px, 7vw, 72px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
}

.chatroom-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 20px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.remember {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 480px;
    margin-top: 40px;
    padding: 14px 16px;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-panel);
}

.remember__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
}

.remember__label {
    font-size: 15px;
    font-weight: 600;
}

.remember__hint {
    font-size: 13px;
    color: var(--color-text-secondary);
}

.remember__switch {
    position: relative;
    flex-shrink: 0;
    width: 51px;
    height: 31px;
    margin: 0;
    border-radius: 31px;
    background: var(--color-inset);
    appearance: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: var(--color-text-secondary);
        transition:
            transform 0.2s ease,
            background-color 0.2s ease;
    }

    &:checked {
        background: var(--color-accent);
    }

    &:checked::after {
        background: var(--color-black);
        transform: translateX(20px);
    }

    &:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 3px;
    }
}
</style>
