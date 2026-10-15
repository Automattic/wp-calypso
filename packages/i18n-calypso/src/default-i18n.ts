import I18N from './i18n';
import type { I18N as I18NInstance } from './types';

// TypeScript can't type the prototype-based JS constructor, so describe it with the package's
// public interface (plus `state`, which the package exports but the interface omits).
type I18NConstructor = new () => I18NInstance & { state: unknown };

export default new ( I18N as unknown as I18NConstructor )();
