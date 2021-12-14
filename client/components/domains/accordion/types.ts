import { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type AccordionProps = {
	children: ReactNode;
	title: string | TranslateResult;
	subtitle?: string | TranslateResult;
	expanded?: boolean;
};
