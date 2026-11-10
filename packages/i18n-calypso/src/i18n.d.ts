import type { I18N as I18NInstance } from './types';

// Types the prototype-based constructor in `i18n.js`, which TypeScript can't infer.
declare const I18N: new () => I18NInstance & { state: unknown };
export default I18N;
