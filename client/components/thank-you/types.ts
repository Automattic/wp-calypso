import { TranslateResult } from 'i18n-calypso';
import * as React from 'react';
import { Theme } from 'calypso/types';

export type ThankYouNextStepProps = {
	stepCta?: React.ReactNode;
	stepSection?: TranslateResult;
	stepDescription?: TranslateResult;
	stepKey: string;
	stepTitle?: TranslateResult;
	stepIcon?: React.ReactNode;
};

export type ThankYouNoticeProps = {
	noticeTitle: React.ReactNode;
	noticeIcon?: string;
	noticeIconCustom?: React.ReactNode;
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

export type ThankYouData = [
	ThankYouSectionProps,
	boolean,
	JSX.Element,
	string,
	string,
	string[],
	boolean,
	React.ReactElement | null,
];

export type ThankYouThemeData = [ Theme, ...ThankYouData ];

export type ThankYouSteps = { steps: string[]; additionalSteps: string[] };
