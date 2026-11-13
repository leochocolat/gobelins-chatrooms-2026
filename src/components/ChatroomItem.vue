<template>
    <a
        class="chatroom-card"
        :href="chatroom.url"
        :target="inNativeApp ? null : '_blank'"
        :rel="inNativeApp ? null : 'noopener'"
        @click="onClick"
    >
        <span class="chatroom-card__media">
            <img v-if="showImage" class="chatroom-card__image" :src="chatroom.image" alt="" @error="onImageError" />
            <!-- No image: white tile with an app icon template grid, like iOS's default app icon -->
            <span v-else class="chatroom-card__image chatroom-card__placeholder" aria-hidden="true">
                <svg viewBox="0 0 100 100">
                    <g fill="none" stroke="currentColor" stroke-width="0.6">
                        <rect x="0.5" y="0.5" width="99" height="99" rx="22" />
                        <path d="M0.5 0.5l99 99M99.5 0.5l-99 99M50 0.5v99M0.5 50h99" />
                        <path d="M21 0.5v99M79 0.5v99M0.5 21h99M0.5 79h99" />
                        <rect x="9" y="21" width="82" height="58" />
                        <rect x="21" y="9" width="58" height="82" />
                        <circle cx="50" cy="50" r="40" />
                        <circle cx="50" cy="50" r="18" />
                    </g>
                </svg>
            </span>
            <span class="chatroom-card__actions" aria-hidden="true">
                <span class="chatroom-card__pill">Enter</span>
                <span class="chatroom-card__arrow">
                    <svg viewBox="0 0 12 12">
                        <path
                            d="M3 9L9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </span>
            </span>
        </span>

        <span class="chatroom-card__name">{{ chatroom.name }}</span>

        <span v-if="chatroom.credits" class="chatroom-card__field">
            <!-- <span class="chatroom-card__field-label">Credits</span> -->
            <span v-if="typeof chatroom.credits === 'string'" class="chatroom-card__field-value">
                {{ chatroom.credits }}
            </span>
            <dl v-else class="chatroom-card__field-value chatroom-card__groups">
                <template v-for="group in creditGroups" :key="group.role">
                    <dt>{{ group.role }}</dt>
                    <dd>{{ group.names }}</dd>
                </template>
            </dl>
        </span>
    </a>
</template>

<script setup>
import { computed, ref } from 'vue';
import { isNativeApp, openChatroom } from '@/utils/native.js';

const CREDIT_ROLES = {
    design: 'Design',
    development: 'Development',
};

const props = defineProps({
    chatroom: {
        type: Object,
        required: true,
    },
    remember: {
        type: Boolean,
        default: false,
    },
});

// In a regular browser, chatrooms open in a new tab so the hub stays open
const inNativeApp = isNativeApp();

const imageFailed = ref(false);

const showImage = computed(() => Boolean(props.chatroom.image) && !imageFailed.value);

// credits: { design: ['Name', ...], development: ['Name', ...] }
const creditGroups = computed(() => {
    const credits = props.chatroom.credits ?? {};

    return Object.entries(CREDIT_ROLES)
        .filter(([key]) => credits[key]?.length)
        .map(([key, role]) => ({ role, names: [credits[key]].flat().join(', ') }));
});

function onImageError() {
    imageFailed.value = true;
}

// Inside the native app, let it handle the routing. Otherwise (regular browser), follow the link in a new tab.
function onClick(event) {
    if (openChatroom(props.chatroom, { remember: props.remember })) {
        event.preventDefault();
    }
}
</script>

<style lang="scss" scoped>
.chatroom-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 22px;
    background: var(--color-panel);
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
    color: inherit;
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:active {
        background: var(--color-panel-active);
    }

    &:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 4px;
    }
}

.chatroom-card__media {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    border-radius: 14px;
    // Same tone as the panel so the anti-aliased rounded edge doesn't show a light line
    background: var(--color-panel);
}

.chatroom-card__image {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);

    .chatroom-card:active & {
        transform: scale(1.06);
    }
}

.chatroom-card__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-white);
    color: #d4d4d8;

    svg {
        height: 72%;
        overflow: visible;
    }
}

.chatroom-card__actions {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    gap: 6px;
}

.chatroom-card__arrow,
.chatroom-card__pill {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    border-radius: 32px;
    background: var(--color-accent);
    color: var(--color-black);
}

.chatroom-card__arrow {
    width: 32px;

    svg {
        width: 12px;
        height: 12px;
    }
}

.chatroom-card__pill {
    padding: 0 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.chatroom-card__name {
    padding: 18px 8px 16px;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.01em;
}

// Inset field, like an input in a launcher window
.chatroom-card__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: auto;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--color-inset);
    font-size: 13px;
    line-height: 1.4;
}

.chatroom-card__field-label {
    color: var(--color-text-secondary);
}

.chatroom-card__field-value {
    margin: 0;
    color: var(--color-text);
}

.chatroom-card__groups {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 12px;

    dt {
        color: var(--color-text-secondary);
    }

    dd {
        margin: 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .chatroom-card__image {
        transition: none;
    }
}
</style>
