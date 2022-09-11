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

export const formatReachNumber = (
	reachNumber: number,
	isNegative: boolean,
	deliverMargin: number
) => {
	const percentage = isNegative ? 2 - deliverMargin : deliverMargin;
	const calculated = Math.round( reachNumber * percentage );
	if ( calculated < 1000 ) {
		return calculated.toLocaleString();
	}
	const formatted = Math.round( calculated / 1000 ) * 1000;
	return ( formatted || 0 ).toLocaleString();
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

export const getCampaignOverallSpending = (
	spent_budget_cents: number,
	start_date: string,
	end_date: string
) => {
	if ( ! spent_budget_cents ) {
		return '-';
	}

	const totalBudgetUsed = spent_budget_cents / 100;
	let daysRun = moment().diff( moment( start_date ), 'days' );
	const campaignDays = moment( end_date ).diff( moment( start_date ), 'days' );
	daysRun = daysRun > campaignDays ? campaignDays : daysRun;

	/* translators: %1$s: Amount, %2$s: Days. eg: $3 over 2 days */
	const overallSpending = sprintf( __( '%1$s over %2$s days' ), totalBudgetUsed, daysRun );
	return overallSpending;
};

export const getCampaignClickthroughRate = ( clicks_total: number, impressions_total: number ) => {
	const clickthroughRate = ( clicks_total * 100 ) / impressions_total || 0;
	return clickthroughRate;
};

export const getCampaignDurationFormatted = ( start_date: string, end_date: string ) => {
	const campaignDays = moment( end_date ).diff( moment( start_date ), 'days' );

	const dateStartFormatted = moment( start_date ).format( 'MMM D' );
	const dateEndFormatted = moment( end_date ).format( 'MMM D' );
	const durationFormatted = `${ dateStartFormatted } - ${ dateEndFormatted } (${ campaignDays } ${ __(
		'days'
	) })`;

	return durationFormatted;
};

export const getCampaignBudgetData = ( budget_cents: number, spent_budget_cents: number ) => {
	const totalBudget = budget_cents / 100;
	const totalBudgetUsed = spent_budget_cents / 100;
	const totalBudgetLeft = totalBudget - totalBudgetUsed;
	return {
		totalBudget,
		totalBudgetUsed,
		totalBudgetLeft,
	};
};

export const getCampaignEstimatedReach = (
	impressions_estimated_total: number,
	deliver_margin_multiplier: number
) => {
	if ( ! impressions_estimated_total ) {
		return '-';
	}

	const estimatedReach = `${ formatReachNumber(
		impressions_estimated_total,
		true,
		deliver_margin_multiplier
	) } - ${ formatReachNumber( impressions_estimated_total, false, deliver_margin_multiplier ) }`;

	return estimatedReach;
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
