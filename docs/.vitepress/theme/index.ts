import DefaultTheme from 'vitepress/theme'
import Figure from './Figure.vue'
import TypingDemo from './TypingDemo.vue'
import MacCandidatePreview from './MacCandidatePreview.vue'
import SyncScopeDemo from './SyncScopeDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Figure', Figure)
    app.component('TypingDemo', TypingDemo)
    app.component('MacCandidatePreview', MacCandidatePreview)
    app.component('SyncScopeDemo', SyncScopeDemo)
  }
}
