<template>
    <div class="root">
        <h1 class="title">Chatrooms</h1>
        <ul class="chatroom-list">
            <li v-for="chatroom in chatrooms" :key="chatroom.id">
                <ChatroomItem :chatroom="chatroom" />
            </li>
        </ul>
    </div>
</template>

<script setup>
import chatrooms from '@/config/chatrooms.json';
import ChatroomItem from 'components/ChatroomItem.vue';
</script>

<style lang="scss" scoped>
.root {
    max-width: 640px;
    margin: 0 auto;
    padding: calc(24px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right))
        calc(24px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left));
}

.title {
    margin: 0 0 24px;
    font-size: 34px;
    font-weight: 700;
}

.chatroom-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
}
</style>
