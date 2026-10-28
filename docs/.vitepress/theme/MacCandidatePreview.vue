<script setup lang="ts">
defineProps<{
  code: string
  items: string[]
  caption?: string
}>()
</script>

<template>
  <figure class="mac-cand-preview">
    <div class="stage" role="img" :aria-label="`输入 ${code} 后的 macOS 候选条`">
      <div class="top">
        <span class="dots" aria-hidden="true"><i /><i /><i /></span>
        <span>无标题</span>
      </div>
      <div class="doc">
        <p class="line">
          <span class="comp">{{ code }}</span><span class="caret" aria-hidden="true" />
        </p>
        <div class="mac-cand-bar wrap" aria-label="候选">
          <span
            v-for="(item, i) in items"
            :key="item + i"
            class="mac-cand-item"
            :class="{ on: i === 0 }"
          >
            <span class="idx">{{ i + 1 }}.</span>
            <span class="word">{{ item }}</span>
          </span>
        </div>
      </div>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.mac-cand-preview {
  margin: 16px 0 8px;
}
.stage {
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.top {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  padding: 0 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 12px;
  box-sizing: border-box;
}
.dots { display: flex; gap: 8px; }
.dots i { width: 14px; height: 14px; border-radius: 50%; display: block; }
.dots i:nth-child(1) { background: #ff5f57; }
.dots i:nth-child(2) { background: #febc2e; }
.dots i:nth-child(3) { background: #28c840; }
.doc {
  padding: 22px 18px 20px;
  position: relative;
}
.line {
  margin: 0;
  font-size: 22px;
  min-height: 1.4em;
}
/* 预览宽度不够横排一整页时换行，避免裁切 */
.mac-cand-preview :deep(.mac-cand-bar.wrap) {
  position: relative;
  left: 0;
  top: auto;
  margin-top: 8px;
  flex-wrap: wrap;
  max-width: 100%;
  white-space: normal;
}
.mac-cand-preview :deep(.mac-cand-item) {
  white-space: nowrap;
}
.comp {
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: 0.04em;
}
.caret {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  background: #3378f5;
  vertical-align: text-bottom;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink { 50% { opacity: 0; } }
figcaption {
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
