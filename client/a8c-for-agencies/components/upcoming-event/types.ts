import { Moment } from 'moment';

export type UpcomingEventProps = {
	id: string;
	date: Moment;
	title: string;
	subtitle: string;
	description: string;
	registrationUrl: string;
	logoUrl: string;
	imageUrl: string;
	trackEventName: string;
	dateClassName?: string;
	imageClassName?: string;
};
