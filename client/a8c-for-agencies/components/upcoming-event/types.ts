import { TranslateResult } from 'i18n-calypso';
import { Moment } from 'moment';

export type UpcomingEventProps = {
	id: string;
	date: { from: Moment; to: Moment };
	displayDate?: string;
	title: string;
	subtitle: string;
	descriptions: TranslateResult[];
	logoUrl: string;
	imageUrl: string;
	trackEventName: string;
	dateClassName?: string;
	imageClassName?: string;
	cta: {
		label: string;
		url: string;
	};
	extraContent?: React.ReactNode;
};
