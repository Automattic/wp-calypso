/**
 * External dependencies
 */
import { TranslateResult } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */

export type ThankYouNextStepProps = {
	stepCta: React.ReactNode | React.ReactFragment;
	stepDescription: TranslateResult;
	stepKey: string;
	stepTitle: TranslateResult;
};

export type ThankYouSectionProps = {
	nextSteps: ThankYouNextStepProps[];
	sectionKey: string;
	sectionTitle: TranslateResult;
};

export type ThankYouProps = {
	containerClassName?: string;
	headerClassName?: string;
	sections: ThankYouSectionProps[];
	showSupportSection?: boolean;
	thankYouImage: {
		alt: string | TranslateResult;
		src: string;
	};
	thankYouImageFooter?: string | TranslateResult;
	thankYouImageFooterSubtitle?: string | TranslateResult;
	thankYouTitle?: TranslateResult;
};

export type ThankYouThemeProps = { theme?: ThankYouThemeType };

type ThankYouThemeType = {
	colors: {
		textColorLight: string;
		borderColorLight: string;
		backgroundColorHeader: string;
		textHeaderColor: string;
	};
	breakpoints: {
		desktopUp?: string;
		tabletUp?: string;
		bigPhoneUp?: string;
		smallPhoneUp?: string;
		tabletDown: string;
	};
	weights: {
		bold: string;
		normal: string;
	};
	fontSize: {
		small: string;
	};
};
