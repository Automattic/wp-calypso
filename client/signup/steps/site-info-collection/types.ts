import { TranslateResult } from 'i18n-calypso';

export interface AccordionSectionProps {
	title: TranslateResult;
	showSkip: boolean;
	summary: string | undefined;
}
