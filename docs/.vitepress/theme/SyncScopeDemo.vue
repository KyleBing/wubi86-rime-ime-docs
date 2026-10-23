<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type Phase = 'idle' | 'upload' | 'download' | 'merge'

const phase = ref<Phase>('idle')
const tick = ref(0)
let timer = 0

const phases: Phase[] = ['idle', 'upload', 'idle', 'download', 'idle', 'merge']

const statusText = computed(() => {
  switch (phase.value) {
    case 'upload':
      return '本地 → 云端：上传个人词'
    case 'download':
      return '云端 → 本地：覆盖个人词'
    case 'merge':
      return '增量合并：并入云端多出来的词'
    default:
      return '只同步个人词库，其它文件不动'
  }
})

const packets = computed(() => {
  if (phase.value === 'idle') return []
  const count = phase.value === 'merge' ? 3 : 2
  return Array.from({ length: count }, (_, i) => i)
})

function step() {
  tick.value += 1
  phase.value = phases[tick.value % phases.length]
  timer = window.setTimeout(step, phase.value === 'idle' ? 1600 : 2400)
}

onMounted(() => {
  step()
})

onUnmounted(() => {
  window.clearTimeout(timer)
})
</script>

<template>
  <div class="sync-demo" aria-label="同步范围示意">
    <div class="board">
      <section class="panel local">
        <header>
          <span class="badge">本机 Rime</span>
          <span class="sub">import_tables</span>
        </header>
        <ul class="stack">
          <li class="file muted">
            <code>wubi86_jidian.dict.yaml</code>
            <em>主码表 · 不进云</em>
          </li>
          <li class="file muted">
            <code>wubi86_jidian_extra.dict.yaml</code>
            <em>扩展 · 可单独拉取</em>
          </li>
          <li class="file muted">
            <code>wubi86_jidian_user_hamster.dict.yaml</code>
            <em>其它用户文件 · 手动</em>
          </li>
          <li
            class="file sync"
            :class="{ active: phase !== 'idle' }"
          >
            <code>wubi86_jidian_user.dict.yaml</code>
            <em>个人词 · 双向同步</em>
            <div class="snippet" aria-hidden="true">
              <span>## 常用</span>
              <span>玫枫五笔	gsgt	100000</span>
              <span>码表助手	glwt</span>
            </div>
          </li>
        </ul>
      </section>

      <section class="bridge" aria-hidden="true">
        <div class="rail">
          <i
            v-for="p in packets"
            :key="`${phase}-${tick}-${p}`"
            class="packet"
            :class="[phase, `n${p}`]"
          />
        </div>
        <div class="ops">
          <span :class="{ on: phase === 'upload' }">上传</span>
          <span :class="{ on: phase === 'merge' }">合并</span>
          <span :class="{ on: phase === 'download' }">下载</span>
        </div>
      </section>

      <section class="panel cloud">
        <header>
          <span class="badge cloud-badge">云端备份</span>
          <span class="sub">portal 账号</span>
        </header>
        <div class="cloud-box" :class="{ pulse: phase !== 'idle' }">
          <code>wubi86_jidian_user.dict.yaml</code>
          <p>与 Mac / iOS / Windows / 码表助手共用同一份个人词</p>
          <ul>
            <li>≤ 40 000 字（约 100 KB）</li>
            <li>约可放 5 000 条个人词</li>
          </ul>
        </div>
      </section>
    </div>
    <p class="hint">{{ statusText }}</p>
  </div>
</template>

<style scoped>
.sync-demo {
  margin: 20px 0 8px;
}

.board {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(88px, 0.55fr) minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(196, 56, 56, 0.08), transparent 55%),
    radial-gradient(100% 70% at 100% 20%, rgba(51, 120, 245, 0.08), transparent 50%),
    var(--vp-c-bg-soft);
  overflow: hidden;
}

.panel {
  min-width: 0;
}

header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(196, 56, 56, 0.12);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 600;
}

.cloud-badge {
  background: rgba(51, 120, 245, 0.12);
  color: #3378f5;
}

.sub {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.stack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.file {
  position: relative;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
}

.file code {
  display: block;
  font-size: 12px;
  word-break: break-all;
}

.file em {
  display: block;
  margin-top: 4px;
  font-style: normal;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.file.muted {
  opacity: 0.58;
  filter: grayscale(0.25);
}

.file.sync {
  border-color: rgba(196, 56, 56, 0.45);
  box-shadow: 0 0 0 1px rgba(196, 56, 56, 0.08);
}

.file.sync.active {
  transform: translateY(-1px);
  border-color: var(--vp-c-brand-1);
  box-shadow:
    0 0 0 1px rgba(196, 56, 56, 0.18),
    0 10px 24px rgba(196, 56, 56, 0.12);
}

.snippet {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(28, 28, 30, 0.04);
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.snippet span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .snippet {
  background: rgba(255, 255, 255, 0.05);
}

.bridge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 220px;
}

.rail {
  position: relative;
  width: 100%;
  max-width: 120px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(196, 56, 56, 0.25), rgba(51, 120, 245, 0.25));
  overflow: visible;
}

.packet {
  position: absolute;
  top: 50%;
  left: 0;
  width: 10px;
  height: 10px;
  margin-top: -5px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 0 4px rgba(196, 56, 56, 0.15);
  opacity: 0;
}

.packet.upload {
  animation: fly-right 1.8s ease-in-out forwards;
}

.packet.download {
  background: #3378f5;
  box-shadow: 0 0 0 4px rgba(51, 120, 245, 0.15);
  animation: fly-left 1.8s ease-in-out forwards;
}

.packet.merge {
  background: #2f9e6b;
  box-shadow: 0 0 0 4px rgba(47, 158, 107, 0.15);
  animation: fly-both 2s ease-in-out forwards;
}

.packet.n1 { animation-delay: 0.18s; }
.packet.n2 { animation-delay: 0.36s; }

@keyframes fly-right {
  0% { left: 0%; opacity: 0; transform: scale(0.6); }
  15% { opacity: 1; transform: scale(1); }
  85% { opacity: 1; }
  100% { left: calc(100% - 10px); opacity: 0; transform: scale(0.7); }
}

@keyframes fly-left {
  0% { left: calc(100% - 10px); opacity: 0; transform: scale(0.6); }
  15% { opacity: 1; transform: scale(1); }
  85% { opacity: 1; }
  100% { left: 0%; opacity: 0; transform: scale(0.7); }
}

@keyframes fly-both {
  0% { left: 8%; opacity: 0; transform: scale(0.6); }
  20% { opacity: 1; transform: scale(1); }
  50% { left: 46%; }
  80% { opacity: 1; }
  100% { left: 84%; opacity: 0; transform: scale(0.7); }
}

.ops {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.ops span {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 11px;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.ops span.on {
  color: white;
  border-color: transparent;
  background: var(--vp-c-brand-1);
}

.ops span.on:nth-child(2) { background: #2f9e6b; }
.ops span.on:nth-child(3) { background: #3378f5; }

.cloud-box {
  height: 100%;
  min-height: 220px;
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px dashed rgba(51, 120, 245, 0.35);
  background: rgba(51, 120, 245, 0.06);
  transition: box-shadow 0.35s ease, border-color 0.35s ease;
}

.cloud-box.pulse {
  border-style: solid;
  border-color: rgba(51, 120, 245, 0.55);
  box-shadow: 0 10px 28px rgba(51, 120, 245, 0.12);
}

.cloud-box code {
  display: block;
  font-size: 12px;
  word-break: break-all;
  color: #3378f5;
}

.cloud-box p {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-1);
  line-height: 1.55;
}

.cloud-box ul {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.hint {
  margin: 10px 2px 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  min-height: 1.4em;
}

@media (max-width: 820px) {
  .board {
    grid-template-columns: 1fr;
  }

  .bridge {
    min-height: 72px;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 4px;
  }

  .rail {
    flex: 1;
    max-width: none;
  }

  .cloud-box {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .packet,
  .file.sync,
  .cloud-box {
    animation: none !important;
    transition: none !important;
  }
}
</style>
