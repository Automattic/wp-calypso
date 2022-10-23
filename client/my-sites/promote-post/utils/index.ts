import { __, sprintf } from '@wordpress/i18n';
import moment from 'moment';
import {
	AudienceList,
	AudienceListKeys,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';

export const getPostType = ( type: string ) => {
	switch ( type ) {
		case 'post': {
			return __( 'Post' );
		}
		case 'page': {
			return __( 'Page' );
		}
		default:
			return type;
	}
};

export const getCampaignStatusBadgeColor = ( status: string ) => {
	switch ( status ) {
		case 'created': {
			return 'info-blue';
		}
		case 'rejected': {
			return 'error';
		}
		case 'approved': {
			return 'info-blue';
		}
		case 'active': {
			return 'info-green';
		}
		case 'canceled': {
			return 'error';
		}
		case 'finished': {
			return 'info-purple';
		}
		default:
			return 'warning';
	}
};

export const getCampaignStatus = ( status: string ) => {
	switch ( status ) {
		case 'created': {
			return __( 'Pending review' );
		}
		case 'rejected': {
			return __( 'Rejected' );
		}
		case 'approved': {
			return __( 'Approved' );
		}
		case 'active': {
			return __( 'Active' );
		}
		case 'canceled': {
			return __( 'Canceled' );
		}
		case 'finished': {
			return __( 'Finished' );
		}
		default:
			return status;
	}
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

	const totalBudgetUsed = spentBudgetCents / 100;
	let daysRun = moment().diff( moment( start_date ), 'days' );
	daysRun = daysRun > campaignDays ? campaignDays : daysRun;

	/* translators: %1$s: Amount, %2$s: Days. eg: $3 over 2 days */
	const overallSpending = sprintf( __( '$%1$s over %2$s days' ), totalBudgetUsed, daysRun );
	return overallSpending;
};

export const getCampaignClickthroughRate = ( clicks_total: number, impressions_total: number ) => {
	const clickthroughRate = ( clicks_total * 100 ) / impressions_total || 0;
	const formattedRate = clickthroughRate.toLocaleString( undefined, {
		useGrouping: true,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	} );
	return formattedRate;
};

export const getCampaignDurationFormatted = ( start_date: string, end_date: string ) => {
	const campaignDays = getCampaignDurationDays( start_date, end_date );

	const dateStartFormatted = moment( start_date ).format( 'MMM D' );
	const dateEndFormatted = moment( end_date ).format( 'MMM D' );
	const durationFormatted = `${ dateStartFormatted } - ${ dateEndFormatted } (${ campaignDays } ${ __(
		'days'
	) })`;

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

export const getCampaignAudienceString = ( audience_list: AudienceList ) => {
	if ( ! audience_list ) {
		return '';
	}
	const audience = Object.keys( audience_list )
		.reduce( ( acc, key ) => {
			return `${ acc }, ${ audience_list[ key as keyof typeof AudienceListKeys ] }`;
		}, '' )
		.substring( 2 );

	return audience;
};

export const canCancelCampaign = ( campaignStatus: string ) => {
	return [ 'created', 'active' ].includes( campaignStatus );
};
