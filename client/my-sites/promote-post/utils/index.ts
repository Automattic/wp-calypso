import config from '@automattic/calypso-config';
import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';
import { Campaign, CampaignStats } from 'calypso/data/promote-post/types';

export const campaignStatus = {
	SCHEDULED: 'scheduled',
	CREATED: 'created',
	REJECTED: 'rejected',
	APPROVED: 'approved',
	ACTIVE: 'active',
	CANCELED: 'canceled',
	FINISHED: 'finished',
};

export const getPostType = ( type: string ) => {
	switch ( type ) {
		case 'post': {
			return __( 'Post' );
		}
		case 'page': {
			return __( 'Page' );
		}
		case 'product': {
			return __( 'Product' );
		}
		default:
			return type;
	}
};

export const getCampaignStatusBadgeColor = ( status: string ) => {
	switch ( status ) {
		case campaignStatus.SCHEDULED: {
			return 'info-blue';
		}
		case campaignStatus.CREATED: {
			return 'info-blue';
		}
		case campaignStatus.REJECTED: {
			return 'error';
		}
		case campaignStatus.APPROVED: {
			return 'info-blue';
		}
		case campaignStatus.ACTIVE: {
			return 'info-green';
		}
		case campaignStatus.CANCELED: {
			return 'error';
		}
		case campaignStatus.FINISHED: {
			return 'info-purple';
		}
		default:
			return 'warning';
	}
};

export const getCampaignStatus = ( status: string ) => {
	switch ( status ) {
		case campaignStatus.SCHEDULED: {
			return __( 'Scheduled' );
		}
		case campaignStatus.CREATED: {
			return __( 'Pending review' );
		}
		case campaignStatus.REJECTED: {
			return __( 'Rejected' );
		}
		case campaignStatus.APPROVED: {
			return __( 'Approved' );
		}
		case campaignStatus.ACTIVE: {
			return __( 'Active' );
		}
		case campaignStatus.CANCELED: {
			return __( 'Canceled' );
		}
		case campaignStatus.FINISHED: {
			return __( 'Finished' );
		}
		default:
			return status;
	}
};

export const normalizeCampaignStatus = ( campaign: Campaign ): string => {
	// This is a transactional status, so we just alter this in calypso
	if (
		campaign.status === campaignStatus.ACTIVE &&
		moment().isBefore( campaign.start_date, 'day' )
	) {
		return campaignStatus.SCHEDULED;
	}

	return campaign.status;
};

export const getCampaignDurationDays = ( start_date: string, end_date: string ) => {
	const dateStart = new Date( start_date );
	const dateEnd = new Date( end_date );
	const diffTime = Math.abs( dateEnd.getTime() - dateStart.getTime() );
	return Math.round( diffTime / ( 1000 * 60 * 60 * 24 ) );
};

export const getCampaignOverallSpending = (
	spent_budget_cents: number,
	budget_cents: number,
	start_date: string,
	end_date: string
) => {
	if ( ! spent_budget_cents ) {
		return '-';
	}
	const campaignDays = getCampaignDurationDays( start_date, end_date );
	const spentBudgetCents =
		spent_budget_cents > budget_cents * campaignDays
			? budget_cents * campaignDays
			: spent_budget_cents;

	const totalBudgetUsed = ( spentBudgetCents / 100 ).toFixed( 2 );
	let daysRun = moment().diff( moment( start_date ), 'days' );
	daysRun = daysRun > campaignDays ? campaignDays : daysRun;

	const daysText = daysRun === 1 ? 'day' : 'days';

	if ( daysRun > 0 ) {
		/* translators: %1$s: Amount, %2$s: Days. Singular or plural: Day(s) eg: $3 over 2 days */
		return sprintf( __( '$%1$s over %2$s %3$s' ), totalBudgetUsed, daysRun, daysText );
	}

	/* translators: %1$s: Amount, eg: $3 today */
	return sprintf( __( '$%1$s today' ), totalBudgetUsed );
};

export const getCampaignClickthroughRate = ( clicks_total: number, impressions_total: number ) => {
	const clickthroughRate = ( clicks_total * 100 ) / impressions_total || 0;
	return clickthroughRate.toLocaleString( undefined, {
		useGrouping: true,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	} );
};

export const getCampaignDurationFormatted = ( start_date: string, end_date: string ) => {
	const campaignDays = getCampaignDurationDays( start_date, end_date );

	let durationFormatted;
	if ( campaignDays === 0 ) {
		durationFormatted = '-';
	} else {
		const dateStartFormatted = moment.utc( start_date ).format( 'MMM D' );
		const dateEndFormatted = moment.utc( end_date ).format( 'MMM D' );
		durationFormatted = `${ dateStartFormatted } - ${ dateEndFormatted } (${ campaignDays } ${ __(
			'days'
		) })`;
	}

	return durationFormatted;
};

export const getCampaignBudgetData = (
	budget_cents: number,
	start_date: string,
	end_date: string,
	spent_budget_cents: number
) => {
	const campaignDays = getCampaignDurationDays( start_date, end_date );

	const spentBudgetCents =
		spent_budget_cents > budget_cents * campaignDays
			? budget_cents * campaignDays
			: spent_budget_cents;

	const totalBudget = ( budget_cents * campaignDays ) / 100;
	const totalBudgetUsed = spentBudgetCents / 100;
	const totalBudgetLeft = totalBudget - totalBudgetUsed;
	return {
		totalBudget,
		totalBudgetUsed,
		totalBudgetLeft,
		campaignDays,
	};
};

export const formatCents = ( amount: number ) => {
	return amount.toLocaleString( undefined, {
		useGrouping: true,
		minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
		maximumFractionDigits: 2,
	} );
};

export const getCampaignEstimatedImpressions = ( displayDeliveryEstimate: string ) => {
	if ( ! displayDeliveryEstimate ) {
		return '-';
	}
	const [ minEstimate, maxEstimate ] = displayDeliveryEstimate.split( ':' );
	return `${ ( +minEstimate ).toLocaleString() } - ${ ( +maxEstimate ).toLocaleString() }`;
};

export const canCancelCampaign = ( status: string ) => {
	return [ campaignStatus.SCHEDULED, campaignStatus.CREATED, campaignStatus.ACTIVE ].includes(
		status
	);
};

export const unifyCampaigns = ( campaigns: Campaign[], campaignsStats: CampaignStats[] ) => {
	return campaigns.map( ( campaign ) => {
		const campaignStats = campaignsStats.find(
			( cs: CampaignStats ) => cs.campaign_id === campaign.campaign_id
		);
		return {
			...campaign,
			campaign_stats_loading: ! campaignsStats.length,
			...( campaignStats ? campaignStats : {} ),
		};
	} );
};

/**
 * Update the path by adding the advertising section URL prefix
 *
 * @param {string} path partial URL
 * @returns pathname concatenated with the advertising configured path prefix
 */
export function getAdvertisingDashboardPath( path: string ) {
	const pathPrefix = config( 'advertising_dashboard_path_prefix' ) || '/advertising';
	return `${ pathPrefix }${ path }`;
}
