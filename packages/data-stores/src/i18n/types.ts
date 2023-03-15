import * as selectors from './selectors';
import type { SelectFromMap } from '../mapped-types';
export type I18nSelect = SelectFromMap< typeof selectors >;

export type LocalizedLanguageNames = {
	[ languageSlug: string ]: { name: string; en: string; localized: string };
};
