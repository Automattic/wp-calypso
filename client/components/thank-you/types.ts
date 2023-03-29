import { TranslateResult } from 'i18n-calypso';
import * as React from 'react';

export type ThankYouNextStepProps = {
	stepCta?: React.ReactNode | React.ReactFragment;
	stepSection?: TranslateResult | React.ReactElement;
	stepDescription?: TranslateResult | React.ReactElement;
	stepKey: string;
	stepTitle?: TranslateResult;
	stepIcon?: React.ReactNode;
};

export type ThankYouNoticeProps = {
	noticeTitle: React.ReactNode | React.ReactFragment;
	noticeIcon?: string;
	noticeIconCustom?: React.ReactNode | React.ReactFragment;
};

export type ThankYouSectionProps = {
	nextSteps: ThankYouNextStepProps[];
	sectionKey: string;
	sectionTitle?: TranslateResult;
	nextStepsClassName?: string;
};

export type ThankYouSupportLink = {
	href: string;
	title: TranslateResult;
};

export type ThankYouSupportSectionProps = {
	description: TranslateResult;
	title: TranslateResult;
	links: ThankYouSupportLink[];
};

export type ThankYouProps = {
	containerClassName?: string;
	headerBackgroundColor?: string;
	headerClassName?: string;
	headerTextColor?: string;
	sections: ThankYouSectionProps[];
	showSupportSection?: boolean;
	customSupportSection?: ThankYouSupportSectionProps;
	thankYouImage?: {
		alt: string | TranslateResult;
		src: string;
		width?: string;
		height?: string;
	};
	thankYouTitle?: string | TranslateResult;
	thankYouSubtitle?: string | TranslateResult;
	thankYouHeaderBody?: React.ReactElement | null;
	thankYouNotice?: ThankYouNoticeProps;
};

export type ThankYouData = [ ThankYouSectionProps, boolean, JSX.Element, string[] ];

export type ThankYouSteps = { steps: string[]; additionalSteps: string[] };
