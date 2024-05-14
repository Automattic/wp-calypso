import { SiteIntent } from '@automattic/data-stores/src/onboard';

export type Intent = {
	key: string;
	title: string;
	description: string;
	value: SiteIntent;
};
