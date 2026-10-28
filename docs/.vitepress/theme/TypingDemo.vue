<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

type Scene = 'type' | 'rank' | 'add'

const props = withDefaults(defineProps<{
  variant?: 'mac' | 'ios'
  // type 输入 / rank 排序 / add 造词，各页只播对应那一块
  scene?: Scene
}>(), {
  variant: 'mac',
  scene: 'type'
})

type Cand = {
  text: string
  code?: string
  comment?: string
}

type RankRow = {
  text: string
  code: string
  weight: string
  source: string
}

type Frame = {
  text: string
  code: string
  cands: Cand[]
  hold: number
  scene: Scene
  pressed?: string
  rankDrag?: boolean
  addCode?: string
  addText?: string
  editingCode?: boolean
}

const rankRows: RankRow[] = [
  { text: '玫枫五笔', code: 'gsgt', weight: '100000', source: '用户词' },
  { text: '工木工木', code: 'gsgt', weight: '80', source: '主词库' },
  { text: '示例词', code: 'gsgt', weight: '20', source: '扩展' }
]

const sameCode = ['玫枫五笔', '工木工木', '示例词']

const gsgtCands: Cand[] = [
  { text: '玫枫五笔', code: 'gsgt' },
  { text: '工木工木', code: 'gsgt', comment: '主词库' },
  { text: '示例词', code: 'gsgt', comment: '扩展' }
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const now = new Date()
const hh = pad2(now.getHours())
const mm = pad2(now.getMinutes())
const ss = pad2(now.getSeconds())
const timeText = `${hh}:${mm}:${ss}`
const timeCands: Cand[] = [
  { text: timeText },
  { text: `${hh}:${mm}` },
  { text: String(Math.floor(now.getTime() / 1000)) },
  { text: `${now.getHours()}时${now.getMinutes()}分` },
  { text: `${hh}${mm}${ss}` }
]

const frames: Frame[] = [
  { text: '', code: 'g', cands: [], hold: 280, scene: 'type', pressed: 'g' },
  { text: '', code: 'gg', cands: [], hold: 280, scene: 'type', pressed: 'g' },
  { text: '', code: 'ggt', cands: [], hold: 280, scene: 'type', pressed: 't' },
  { text: '', code: 'ggtt', cands: [{ text: '五笔', code: 'ggtt' }], hold: 1400, scene: 'type' },
  { text: '五笔', code: '', cands: [], hold: 500, scene: 'type' },
  { text: '五笔', code: 'l', cands: [], hold: 240, scene: 'type', pressed: 'l' },
  { text: '五笔', code: 'lt', cands: [], hold: 240, scene: 'type', pressed: 't' },
  { text: '五笔', code: 'lti', cands: [], hold: 240, scene: 'type', pressed: 'i' },
  { text: '五笔', code: 'ltif', cands: [{ text: '输入法', code: 'ltif' }], hold: 1400, scene: 'type' },
  { text: '五笔输入法 ', code: '', cands: [], hold: 600, scene: 'type' },
  { text: '五笔输入法 ', code: 't', cands: [], hold: 240, scene: 'type', pressed: 't' },
  { text: '五笔输入法 ', code: 'ti', cands: [], hold: 240, scene: 'type', pressed: 'i' },
  { text: '五笔输入法 ', code: 'tim', cands: [], hold: 240, scene: 'type', pressed: 'm' },
  { text: '五笔输入法 ', code: 'time', cands: timeCands, hold: 1800, scene: 'type' },
  { text: `五笔输入法 ${timeText} `, code: '', cands: [], hold: 600, scene: 'type' },
  { text: `五笔输入法 ${timeText} `, code: 'g', cands: [], hold: 240, scene: 'type', pressed: 'g' },
  { text: `五笔输入法 ${timeText} `, code: 'gs', cands: [], hold: 240, scene: 'type', pressed: 's' },
  { text: `五笔输入法 ${timeText} `, code: 'gsg', cands: [], hold: 240, scene: 'type', pressed: 'g' },
  { text: `五笔输入法 ${timeText} `, code: 'gsgt', cands: gsgtCands, hold: 1800, scene: 'type' },
  { text: `五笔输入法 ${timeText} `, code: 'gsgt', cands: gsgtCands, hold: 2800, scene: 'rank' },
  { text: `五笔输入法 ${timeText} `, code: 'gsgt', cands: gsgtCands, hold: 2200, scene: 'rank', rankDrag: true },
  { text: `五笔输入法 ${timeText} `, code: 'gsgt', cands: gsgtCands, hold: 4500, scene: 'add', addCode: 'gsgt', addText: '玫枫五笔' }
]

const playlist = computed(() => frames.filter(item => item.scene === props.scene))
const frame = ref<Frame>(playlist.value[0] ?? frames[0])
let timer = 0
let index = 0

const rows = [
  'qwertyuiop'.split(''),
  'asdfghjkl'.split(''),
  'zxcvbnm'.split('')
]

function pressedKey() {
  return frame.value.pressed || ''
}

function step() {
  const list = playlist.value
  if (list.length === 0) return
  if (index >= list.length) index = 0
  frame.value = list[index]
  const hold = list[index].hold
  index = (index + 1) % list.length
  timer = window.setTimeout(step, hold)
}

onMounted(() => {
  step()
})

onUnmounted(() => {
  window.clearTimeout(timer)
})

const scene = computed(() => frame.value.scene)
const text = computed(() => frame.value.text)
const code = computed(() => frame.value.code)
const cands = computed(() => frame.value.cands)
const showBar = computed(() => code.value.length > 0 || cands.value.length > 0)
const showRank = computed(() => scene.value === 'rank')
const showAdd = computed(() => scene.value === 'add')
const hint = computed(() => {
  if (props.variant === 'ios') {
    if (props.scene === 'rank') {
      return '候选栏右侧点「排序」。拖动一行调整顺序，幅度是相对旁边那条候选的权重差。'
    }
    if (props.scene === 'add') {
      return '候选栏右侧点「造词」。先填编码再填词条，同码会列在键区上方。'
    }
    return '示意与 iOS 键盘一致：候选在键上方，右侧是展开、排序、造词。编码画在首选上方。'
  }
  if (props.scene === 'rank') {
    return '候选出现时按 ⌃⌥0 打开排序。拖动一行只改被拖动那一条的权重。'
  }
  if (props.scene === 'add') {
    return '默认 ⌃⌥N 打开造词窗口，不抢当前软件的前台。词条框里可以继续用五笔组字。'
  }
  return '示意用 macOS「简约黑白」皮肤：编码以下划线留在光标处，候选跟在光标旁边。打「五笔输入法」再打 time。'
})
</script>

<template>
  <div class="demo">
    <!-- macOS：记事本 + 简约黑白候选条 + 排序窗 / 造词窗 -->
    <div v-if="props.variant === 'mac'" class="stage" :class="{ tall: showRank || showAdd }">
      <div class="top">
        <span class="dots" aria-hidden="true"><i /><i /><i /></span>
        <span>无标题</span>
      </div>
      <div class="doc">
        <p class="line">
          {{ text }}<span v-if="code" class="comp">{{ code }}</span><span class="caret-wrap"><span class="caret" aria-hidden="true" /><span
            v-if="showBar && !showRank && !showAdd"
            class="mac-cand-bar"
            aria-label="候选"
          >
            <span v-if="cands.length === 0" class="mac-cand-wait">{{ code }}</span>
            <span
              v-for="(item, i) in cands"
              :key="item.text + i"
              class="mac-cand-item"
              :class="{ on: i === 0 }"
            >
              <span class="idx">{{ i + 1 }}.</span>
              <span class="word">{{ item.text }}</span>
              <span v-if="item.code" class="code">{{ item.code }}</span>
              <span v-if="item.comment" class="comment">{{ item.comment }}</span>
            </span>
          </span></span>
        </p>
      </div>

      <div v-if="showRank" class="mac-sheet rank-sheet" aria-label="候选排序">
        <div class="sheet-top">
          <span class="dots" aria-hidden="true"><i /><i /><i /></span>
          <span>候选排序 ⌃⌥0</span>
        </div>
        <div class="sheet-body">
          <div class="rank-head">
            <span class="cap">编码</span>
            <code>{{ code }}</code>
            <span class="cap">幅度</span>
            <span class="seg"><b>5</b><i>10</i></span>
            <button type="button" class="done">完成</button>
          </div>
          <p class="rank-hint">拖动一行调整顺序。幅度 5 是相对旁边那条候选的权重差。</p>
          <div class="rank-table-wrap">
            <table class="rank-table">
              <colgroup>
                <col class="grip">
                <col class="word">
                <col class="mono">
                <col class="weight">
                <col>
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th>词条</th>
                  <th>编码</th>
                  <th>权重</th>
                  <th>词库</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in rankRows"
                  :key="row.text"
                  :class="{ lift: frame.rankDrag && i === 0 }"
                >
                  <td class="grip">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 8h14v1.6H5zm0 3.2h14v1.6H5zm0 3.2h14V16H5z"/></svg>
                  </td>
                  <td class="word">{{ row.text }}</td>
                  <td class="mono">{{ row.code }}</td>
                  <td class="mono" :class="{ edited: frame.rankDrag && i === 0 }">{{ row.weight }}</td>
                  <td class="src">{{ row.source }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="showAdd" class="mac-sheet add-sheet" aria-label="添加自造词">
        <div class="sheet-top">
          <span class="dots" aria-hidden="true"><i /><i /><i /></span>
          <span>添加自造词</span>
        </div>
        <div class="sheet-body add-body">
          <div class="add-row">
            <label>词条</label>
            <div class="field">玫枫五笔</div>
          </div>
          <div class="add-row">
            <label>编码</label>
            <div class="field mono">gsgt</div>
            <span class="note">自动生成，可改</span>
          </div>
          <div class="add-row">
            <label>权重</label>
            <div class="field ghost">可空，默认 100000</div>
          </div>
          <div class="add-row">
            <label>分组</label>
            <div class="field wide">常用</div>
          </div>
          <div class="same-label">同编码词条</div>
          <div class="same-box">
            <span v-for="word in sameCode" :key="word">{{ word }}</span>
          </div>
          <div class="add-actions">
            <button type="button" class="add-btn">添加</button>
            <button type="button" class="add-btn close">添加并关闭</button>
          </div>
        </div>
      </div>
    </div>

    <!-- iOS：系统键盘候选栏、排序面板、键盘内造词 -->
    <div v-else class="phone">
      <p class="note">{{ text }}<span v-if="code && !showAdd" class="comp">{{ code }}</span><span class="caret" aria-hidden="true" /></p>

      <div class="kb">
        <div class="cand-bar">
          <div v-if="showAdd" class="add-status">
            <b :class="{ on: frame.editingCode }">{{ frame.addCode || 'gsgt' }}</b>
            <span class="arrow">→</span>
            <em :class="{ on: !frame.editingCode }">{{ frame.addText || '玫枫五笔' }}</em>
          </div>
          <div v-else class="cand-list">
            <span v-if="!showBar" class="idle" />
            <span v-else-if="cands.length === 0" class="lone">{{ code }}</span>
            <span
              v-for="(item, i) in cands"
              :key="item.text + i"
              class="ios-item"
            >
              <span class="word-wrap">
                <span v-if="i === 0 && code" class="pre">{{ code }}</span>
                <span class="word">{{ item.text }}</span>
              </span>
              <span v-if="item.comment" class="comment">{{ item.comment }}</span>
            </span>
          </div>
          <div class="tools" :class="{ add: showAdd }">
            <template v-if="!showAdd">
              <button type="button" class="icon" aria-label="展开候选">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.2 4H4v4.2h1.6V5.6h2.6zm11.6 0H15.6v1.6h2.6v2.6H20zm0 11.8H18.4v2.6h-2.6V20H20zm-15.8 0V15.6H4V20h4.2v-1.6H5.6z"/></svg>
              </button>
              <i />
              <button v-if="cands.length > 1" type="button" :class="{ active: showRank }">排序</button>
              <i v-if="cands.length > 1" />
              <button type="button">造词</button>
            </template>
            <template v-else>
              <button type="button">取消</button>
              <i />
              <button type="button" class="save">保存</button>
            </template>
          </div>
        </div>

        <div v-if="showAdd" class="same">
          <span class="cap">同码</span>
          <span v-for="word in sameCode" :key="word" :class="{ hit: word === '玫枫五笔' }">{{ word }}</span>
        </div>

        <div v-if="showRank" class="ios-rank" aria-label="候选排序">
          <div class="rank-head">
            <code>{{ code }}</code>
            <span class="seg"><b>5</b><i>10</i></span>
            <button type="button">完成</button>
          </div>
          <p>拖动一行调整顺序。幅度是相对旁边那条候选的权重差。</p>
          <ul>
            <li
              v-for="(row, i) in rankRows"
              :key="row.text"
              :class="{ lift: frame.rankDrag && i === 0 }"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 8h14v1.6H5zm0 3.2h14v1.6H5zm0 3.2h14V16H5z"/></svg>
              <span>{{ row.text }}</span>
              <em>{{ row.weight }}</em>
            </li>
          </ul>
        </div>

        <template v-else>
          <div v-for="(row, ri) in rows" :key="ri" class="kb-row" :class="'r' + ri">
            <button v-if="ri === 2" type="button" class="special" aria-label="Shift">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.2 20 13h-4.2v6.8H8.2V13H4z"/></svg>
            </button>
            <button
              v-for="key in row"
              :key="key"
              type="button"
              class="letter"
              :class="{ down: pressedKey() === key }"
            >{{ key }}</button>
            <button v-if="ri === 2" type="button" class="special" aria-label="删除">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M10.4 6.2 4.6 12l5.8 5.8h9.2V6.2zm2.3 2.2 1.7 1.7 1.7-1.7 1 1-1.7 1.7 1.7 1.7-1 1-1.7-1.7-1.7 1.7-1-1 1.7-1.7-1.7-1.7z"/></svg>
            </button>
          </div>
          <div class="kb-row r3">
            <button type="button" class="special wide">123</button>
            <button type="button" class="special globe" aria-label="切换输入法">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.2A8.8 8.8 0 1 0 20.8 12 8.8 8.8 0 0 0 12 3.2Zm6.9 8h-2.5a12 12 0 0 0-1.1-4.3A7.2 7.2 0 0 1 18.9 11.2Zm-8.7-5.7A10.4 10.4 0 0 1 12.6 11H8.2a10.5 10.5 0 0 1 2-5.7Zm0 13A10.5 10.5 0 0 1 8.2 13h4.4a10.4 10.4 0 0 1-2.4 5.5ZM12.6 13H16a10.4 10.4 0 0 1-2.4 5.5A10.4 10.4 0 0 1 12.6 13Zm.8-2A10.4 10.4 0 0 1 15.8 5.5 7.2 7.2 0 0 1 18.9 11h-5.5ZM5.1 13h2.5a12 12 0 0 0 1.1 4.3A7.2 7.2 0 0 1 5.1 13Zm0-1.8A7.2 7.2 0 0 1 8.7 6.7 12 12 0 0 0 7.6 11.2Z"/></svg>
            </button>
            <button type="button" class="space">空格</button>
            <button type="button" class="special wide">换行</button>
          </div>
        </template>
      </div>
    </div>
    <p class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.demo { margin: 24px 0 8px; }
.stage, .phone {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.top, .sheet-top {
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
.sheet-top { justify-content: center; position: relative; }
.sheet-top .dots { position: absolute; left: 12px; }
.dots { display: flex; gap: 8px; }
.dots i { width: 14px; height: 14px; border-radius: 50%; display: block; }
.dots i:nth-child(1) { background: #ff5f57; }
.dots i:nth-child(2) { background: #febc2e; }
.dots i:nth-child(3) { background: #28c840; }
.stage.tall .doc { min-height: 420px; }
.doc { padding: 22px 18px 72px; min-height: 188px; position: relative; }
.line, .note { margin: 0; font-size: 22px; min-height: 1.4em; }
.note { padding: 14px 16px 10px; font-size: 17px; min-height: 72px; }
.comp {
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: 0.04em;
}
.caret-wrap {
  position: relative;
  display: inline-block;
  width: 2px;
  height: 1.05em;
  vertical-align: text-bottom;
}
.caret {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  background: #3378f5;
  vertical-align: text-bottom;
  animation: blink 1s steps(1) infinite;
}
.caret-wrap .caret {
  display: block;
  height: 100%;
  vertical-align: top;
}
@keyframes blink { 50% { opacity: 0; } }

.mac-sheet {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 36px;
  width: auto;
  border-radius: 10px;
  background: #f6f6f7;
  border: 1px solid #d8d8dc;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  z-index: 2;
}
.sheet-body { padding: 10px 16px 16px; }
.rank-sheet .sheet-body { display: flex; flex-direction: column; gap: 8px; }
.rank-sheet .rank-head,
.rank-sheet .rank-hint { padding: 0; margin: 0; }
.rank-table-wrap {
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.rank-sheet :deep(.rank-table) {
  display: table;
  width: 100%;
  max-width: none;
  margin: 0;
  table-layout: fixed;
}
.rank-head, .ios-rank .rank-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.rank-head .cap, .rank-hint { color: #6e6e73; font-size: 12px; }
.rank-head code, .ios-rank code {
  font-family: ui-monospace, "SF Mono", monospace;
  font-size: 13px;
  flex: 1;
}
.seg {
  display: inline-flex;
  align-items: stretch;
  align-self: center;
  height: 22px;
  border: 1px solid #c7c7cc;
  border-radius: 5px;
  overflow: hidden;
  font-size: 11px;
  box-sizing: border-box;
}
.seg b, .seg i {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8px;
  font-style: normal;
  font-weight: 500;
  line-height: 1;
  box-sizing: border-box;
}
.seg b { background: #0a84ff; color: #fff; }
.done, .ios-rank button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #0a84ff;
  font-weight: 600;
  font-size: 14px;
}
.mac-sheet table {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
  border: none;
}
.mac-sheet col.grip { width: 36px; }
.mac-sheet col.word { width: 36%; }
.mac-sheet col.mono { width: 18%; }
.mac-sheet col.weight { width: 16%; }
.mac-sheet th, .mac-sheet td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ececef;
}
.mac-sheet th { color: #6e6e73; font-weight: 500; font-size: 11px; }
.mac-sheet .grip { width: 22px; color: #8e8e93; }
.mac-sheet .grip svg, .ios-rank li svg { width: 14px; height: 14px; display: block; }
.mac-sheet .mono { font-family: ui-monospace, "SF Mono", monospace; font-size: 12px; color: #6e6e73; }
.mac-sheet .src { color: #6e6e73; }
.mac-sheet tr.lift, .ios-rank li.lift {
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 18px rgba(10, 132, 255, 0.28);
  outline: 1px solid rgba(10, 132, 255, 0.45);
  transform: translateY(10px);
}
.mac-sheet td.edited { color: #0a84ff; font-weight: 600; }

.add-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  padding: 12px 16px 14px;
}
.add-row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  height: 32px;
}
.add-row label,
.add-row .field,
.add-row .note {
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin: 0;
  font-size: 13px;
  line-height: 1;
}
.add-row label { color: #6e6e73; }
.add-row .field {
  grid-column: 2;
  padding: 0 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #d0d0d4;
}
.add-row .field.wide { grid-column: 2 / -1; }
.add-row .field.mono { font-family: ui-monospace, "SF Mono", monospace; }
.add-row .ghost { color: #c7c7cc; }
.add-row .note { color: #8e8e93; font-size: 12px; padding: 0 4px 0 8px; }
.add-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}
.add-actions .add-btn {
  appearance: none;
  height: 32px;
  min-width: 96px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: #c43838;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}
.add-actions .add-btn.close {
  background: #c43838;
}
.same-label { color: #6e6e73; font-size: 13px; margin-top: 4px; }
.same-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #d0d0d4;
}
.same-box span { font-size: 13px; }

.phone { max-width: 390px; background: #f2f2f7; }

.kb {
  margin: 0;
  padding: 0 3px 18px;
  background: #d1d5db;
  color: #1c1c1e;
}
.cand-bar {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 8px 0 6px;
  gap: 8px;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.18);
}
.cand-list, .add-status {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  height: 52px;
}
.add-status { gap: 2px; }
.add-status b, .add-status em {
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
}
.add-status b { font-size: 20px; font-weight: 500; }
.add-status .arrow { font-size: 16px; color: #3c3c43; padding: 0 2px; }
.add-status .on { box-shadow: inset 0 -2px 0 #1c1c1e; }
.lone {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.06em;
}
.ios-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 10px;
  height: 52px;
  font-size: 20px;
  font-weight: 500;
  white-space: nowrap;
}
.ios-item .word-wrap {
  position: relative;
  display: inline-block;
}
.ios-item .pre {
  position: absolute;
  left: 0;
  bottom: calc(100% + 3px);
  font-size: 8px;
  line-height: 1;
  font-family: ui-monospace, "SF Mono", monospace;
  font-weight: 400;
  color: rgba(28, 28, 30, 0.5);
  letter-spacing: 0.04em;
}
.ios-item .comment {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 400;
  color: rgba(28, 28, 30, 0.55);
}
.tools {
  display: flex;
  align-items: center;
  height: 30px;
  border-radius: 15px;
  background: rgba(142, 142, 147, 0.55);
  flex-shrink: 0;
  overflow: hidden;
  z-index: 2;
}
.tools button {
  border: 0;
  background: transparent;
  height: 30px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #1c1c1e;
}
.tools button.icon { padding: 0 8px; display: flex; align-items: center; }
.tools svg { width: 13px; height: 13px; display: block; }
.tools i { width: 1px; height: 16px; background: rgba(60, 60, 67, 0.29); }
.tools .save { font-weight: 700; }
.tools .active { color: #007aff; }

.same {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 10px;
  background: #e5e5ea;
  font-size: 16px;
  font-weight: 500;
}
.same .cap { font-size: 12px; font-weight: 600; color: rgba(28, 28, 30, 0.55); }
.same span.hit {
  background: #f95353;
  color: #fff;
  border-radius: 8px;
  padding: 4px 8px;
}

.ios-rank {
  padding: 8px 12px 12px;
  min-height: 212px;
  background: #e5e5ea;
}
.ios-rank p { margin: 4px 0 8px; font-size: 12px; color: rgba(28, 28, 30, 0.55); }
.ios-rank ul { list-style: none; margin: 0; padding: 0; }
.ios-rank li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.18);
  font-size: 17px;
  font-weight: 500;
}
.ios-rank li em {
  margin-left: auto;
  font-style: normal;
  font-family: ui-monospace, "SF Mono", monospace;
  font-size: 14px;
  font-weight: 400;
  color: rgba(28, 28, 30, 0.7);
}
.ios-rank li.lift em { color: #f95353; font-weight: 600; }

.kb-row { display: flex; justify-content: center; gap: 5px; margin-top: 8px; padding: 0 3px; }
.kb-row.r1 { padding: 0 18px; }
.kb-row.r3 { margin-top: 8px; }
.kb-row button {
  flex: 1;
  height: 42px;
  border: 0;
  border-radius: 5.5px;
  background: #fff;
  color: #1c1c1e;
  font-size: 22px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}
.kb-row button.letter { max-width: 33px; }
.kb-row button.special {
  background: #adb3bc;
  max-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.kb-row button.special svg { width: 20px; height: 20px; }
.kb-row button.wide { max-width: 88px; font-size: 15px; font-weight: 400; }
.kb-row button.globe { max-width: 42px; }
.kb-row button.space { flex: 4; max-width: none; font-size: 15px; }
.kb-row button.down { background: #adb3bc; }

.hint { margin: 8px 2px 0; color: var(--vp-c-text-2); font-size: 13px; }

:global(html.dark) .phone { background: #000; }
:global(html.dark) .note { color: #f2f2f7; }
:global(html.dark) .kb { background: #1c1c1e; color: #f2f2f7; }
:global(html.dark) .kb-row button.letter { background: #636366; color: #fff; box-shadow: 0 1px 0 #000; }
:global(html.dark) .kb-row button.special, :global(html.dark) .kb-row button.down { background: #3a3a3c; color: #fff; }
:global(html.dark) .tools { background: rgba(72, 72, 74, 0.7); }
:global(html.dark) .tools button { color: #f2f2f7; }
:global(html.dark) .ios-item .pre, :global(html.dark) .ios-item .comment { color: rgba(235, 235, 245, 0.5); }
:global(html.dark) .ios-rank, :global(html.dark) .same { background: #2c2c2e; color: #f2f2f7; }
:global(html.dark) .mac-sheet { background: #2c2c2e; border-color: #3a3a3c; color: #f2f2f7; }
:global(html.dark) .mac-sheet table, :global(html.dark) .add-body .field, :global(html.dark) .same-box { background: #1c1c1e; border-color: #3a3a3c; color: #f2f2f7; }
</style>
