export type EmailFrequencyType = 'instantly' | 'daily' | 'weekly';

export type SiteType = {
	id: number;
	name: string;
	icon: string;
	url: string;
	date: Date;
	emailFrequency: EmailFrequencyType;
};
