import { TranslateResult } from 'i18n-calypso';
import { Moment } from 'moment';

export type UpcomingEventProps = {
	id: string;
	date: { from: Moment; to: Moment };
	displayDate?: string;
	title: TranslateResult;
	subtitle: string;
	descriptions: TranslateResult[];
	logoUrl?: string;
	logoElement?: React.ReactNode;
	imageUrl?: string;
	dateClassName?: string;
	imageClassName?: string;
	ctas: {
		label: string;
		url: string;
		trackEventName: string;
		variant: string;
		isExternal?: boolean;
	}[];
	extraContent?: React.ReactNode;
};
