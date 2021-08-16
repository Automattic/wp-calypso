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

export type ThankYouSupportLink = {
	href: string;
	title: TranslateResult;
};

export type ThankYouSupportSectionProps = {
	links: ThankYouSupportLink[];
	description: TranslateResult;
	title: TranslateResult;
};

export type ThankYouProps = {
	containerClassName?: string;
	headerBackgroundColor?: string;
	headerClassName?: string;
	headerTextColor?: string;
	sections: ThankYouSectionProps[];
	showSupportSection?: boolean;
	customSupportSection?: ThankYouSupportSectionProps;
	thankYouImage: {
		alt: string | TranslateResult;
		src: string;
	};
	thankYouTitle?: string | TranslateResult;
	thankYouSubtitle?: string | TranslateResult;
};
