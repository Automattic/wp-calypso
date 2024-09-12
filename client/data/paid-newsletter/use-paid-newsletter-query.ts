import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export type StepId = 'content' | 'subscribers' | 'paid-subscribers' | 'summary';
export type StepStatus = 'initial' | 'skipped' | 'importing' | 'done';

export interface ContentStepContent {}

export interface SubscribersStepContent {
	meta?: {
		email_count: string;
		id: number;
		paid_subscribers_count: string;
		platform: string;
		scheduled_at: string;
		status: string;
		subscribed_count: string | null;
		timestamp: string;
	};
}

export interface Product {
	currency: string;
	id: number;
	interval: string;
	price: string;
	title: string;
}

export interface Plan {
	active_subscriptions: boolean;
	is_active: boolean;
	name: string;
	plan_amount_decimal: number;
	plan_currency: string;
	plan_id: string;
	plan_interval: string;
	product_id: string;
}

export interface PaidSubscribersStepContent {
	available_tiers: Product[];
	connect_url?: string;
	is_connected_stripe: boolean;
	map_plans: Record< string, string >;
	plans: Plan[];
}

export interface SummaryStepContent {}

interface Step< T > {
	status: StepStatus;
	content?: T;
}

export interface Steps {
	content: Step< ContentStepContent >;
	subscribers: Step< SubscribersStepContent >;
	'paid-subscribers': Step< PaidSubscribersStepContent >;
	summary: Step< SummaryStepContent >;
}

export interface PaidNewsletterData {
	current_step: StepId;
	steps: Steps;
}

const REFRESH_INTERVAL = 2000; // every 2 seconds.

export const usePaidNewsletterQuery = (
	engine: string,
	currentStep: StepId,
	siteId?: number,
	autoRefresh?: boolean
) => {
	return useQuery( {
		enabled: !! siteId,
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'paid-newsletter-importer', siteId, engine ],
		queryFn: (): Promise< PaidNewsletterData > => {
			return wp.req.get(
				{
					path: `/sites/${ siteId }/site-importer/paid-newsletter`,
					apiNamespace: 'wpcom/v2',
				},
				{
					engine: engine,
					current_step: currentStep,
				}
			);
		},
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: true,
		staleTime: 6000, // 10 minutes
		refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
	} );
};
