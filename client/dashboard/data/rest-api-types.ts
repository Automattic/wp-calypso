import { SitePlan, SiteOptions } from './types';

export interface WPCOMRESTAPISite {
	ID: string;
	name: string;
	URL: string;
	icon: {
		ico: string;
	};
	plan: SitePlan;
	active_modules: string[];
	subscribers_count: number;
	options: SiteOptions;
	is_deleted: boolean;
}
