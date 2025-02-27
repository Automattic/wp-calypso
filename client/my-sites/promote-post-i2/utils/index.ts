import config from '@automattic/calypso-config';
import { SiteDetails } from '@automattic/data-stores';
import { InfiniteData } from '@tanstack/react-query';
import { __, _x } from '@wordpress/i18n';
import { getCurrencyObject } from 'i18n-calypso';
import moment from 'moment';
import {
	BlazablePost,
	BlazePagedItem,
	Campaign,
	CampaignQueryResult,
	PostQueryResult,
} from 'calypso/data/promote-post/types';
import { PagedBlazeContentData } from 'calypso/my-sites/promote-post-i2/main';

export const campaignStatus = {
	SCHEDULED: 'scheduled',
	CREATED: 'created',
	REJECTED: 'rejected',
	APPROVED: 'approved',
	ACTIVE: 'active',
	CANCELED: 'canceled',
	FINISHED: 'finished',
	PROCESSING: 'processing',
	SUSPENDED: 'suspended',
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

export const getWidgetParams = ( keyValue: string ) => {
	const postPartial = keyValue?.split( '_' )[ 0 ];
	const campaignPartial = keyValue?.split( '_' )[ 1 ];
	const selectedPostId = postPartial?.split( '-' )[ 1 ] || '';
	const selectedCampaignId = campaignPartial?.split( '-' )[ 1 ] || '';
	return {
		selectedPostId,
		selectedCampaignId,
	};
};

export const getCampaignStatusBadgeColor = ( status?: string ) => {
	switch ( status ) {
		case campaignStatus.SCHEDULED: {
			return 'info-blue';
		}
		case campaignStatus.CREATED: {
			return 'warning';
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
			return 'info-blue';
		}
		case campaignStatus.SUSPENDED: {
			return 'error';
		}
		default:
			return 'warning';
	}
};

export const getCampaignStatus = ( status?: string ) => {
	switch ( status ) {
		case campaignStatus.SCHEDULED: {
			return __( 'Scheduled' );
		}
		case campaignStatus.CREATED: {
			return __( 'In moderation' );
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
			return __( 'Completed' );
		}
		case campaignStatus.PROCESSING: {
			return __( 'Creating' );
		}
		case campaignStatus.SUSPENDED: {
			return __( 'Suspended' );
		}
		default:
			return status;
	}
};

const calculateDurationDays = ( start: Date, end: Date ) => {
	const diffTime = end.getTime() - start.getTime();
	return diffTime < 0 ? 0 : Math.round( diffTime / ( 1000 * 60 * 60 * 24 ) );
};

export const getCampaignDurationDays = ( start_date: string, end_date: string ) => {
	const dateStart = new Date( start_date );
	const dateEnd = new Date( end_date );
	return calculateDurationDays( dateStart, dateEnd );
};

export const getCampaignDurationFormatted = (
	start_date?: string,
	end_date?: string,
	is_evergreen = false,
	status: string = '',
	format: string = ''
) => {
	if ( ! start_date || ! end_date ) {
		return '-';
	}

	const campaignDays = getCampaignDurationDays( start_date, end_date );

	if ( campaignDays === 0 ) {
		return '-';
	}

	if ( ! format ) {
		// translators: Moment.js date format, `MMM` refers to short month name (e.g. `Sep`), `D`` refers to day of month (e.g. `5`). Wrap text [] to be displayed as is, for example `D [de] MMM` will be formatted as `5 de sep.`.
		format = _x( 'MMM D', 'shorter date format' );
	}
	const dateStartFormatted = moment.utc( start_date ).format( format );

	// A campaign without an "end date", show start -> until stopped (if not ended)
	if ( is_evergreen ) {
		if ( status === 'active' ) {
			return `${ dateStartFormatted } - ${ __( 'Until stopped' ) }`;
		}

		if ( status === 'scheduled' || status === 'created' ) {
			return '-';
		}
	}

	// Else show start -> end
	const dateEndFormatted = moment.utc( end_date ).format( format );
	return `${ dateStartFormatted } - ${ dateEndFormatted }`;
};

export const getCampaignStartDateFormatted = ( start_date?: string ) => {
	if ( ! start_date ) {
		return '-';
	}

	// translators: Moment.js date format. LLL: June 7, 2024 9:27 AM
	const format = _x( 'LLL', 'datetime format' );
	return moment.utc( start_date ).format( format );
};

export const getCampaignActiveDays = ( start_date?: string, end_date?: string ) => {
	if ( ! start_date || ! end_date ) {
		return 0;
	}

	const now = new Date();
	const dateStart = new Date( start_date );
	let dateEnd = new Date( end_date );
	if ( dateEnd.getTime() > now.getTime() ) {
		dateEnd = now;
	}

	return calculateDurationDays( dateStart, dateEnd );
};

export const getCampaignBudgetData = (
	budget_cents: number,
	start_date: string,
	end_date: string,
	spent_budget_cents: number,
	is_evergreen = 0
) => {
	let campaignDays;
	if ( is_evergreen ) {
		campaignDays = 7;
	} else {
		campaignDays = getCampaignDurationDays( start_date, end_date );
	}

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

export const formatCents = ( amount: number, decimals?: number ) => {
	return amount.toLocaleString( undefined, {
		useGrouping: true,
		minimumFractionDigits: decimals ?? ( amount % 1 !== 0 ? 2 : 0 ),
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

export const formatNumber = ( number: number, onlyPositives = false ): string => {
	if ( ! number || ( onlyPositives && number < 0 ) ) {
		return '-';
	}
	return number.toLocaleString();
};

export const formatLargeNumber = ( number: number ): string => {
	if ( number >= 1000000 ) {
		return (
			( number / 1000000 )
				.toFixed( 3 )
				.replace( /\.?0+$/, '' )
				.toLocaleString() + 'M'
		);
	} else if ( number >= 100000 ) {
		return (
			( number / 1000 )
				.toFixed( 2 )
				.replace( /\.?0+$/, '' )
				.toLocaleString() + 'K'
		);
	}
	return formatNumber( number );
};

export const canCancelCampaign = ( status: string ) => {
	return [ campaignStatus.SCHEDULED, campaignStatus.CREATED, campaignStatus.ACTIVE ].includes(
		status
	);
};

export const canPromoteAgainCampaign = ( status: string ) => {
	if ( status === campaignStatus.REJECTED ) {
		return false;
	}

	return [
		campaignStatus.SCHEDULED,
		campaignStatus.ACTIVE,
		campaignStatus.FINISHED,
		campaignStatus.CREATED,
		campaignStatus.CANCELED,
		campaignStatus.PROCESSING,
	].includes( status );
};

export const canGetCampaignStats = ( status: string ) => {
	return [ campaignStatus.ACTIVE, campaignStatus.FINISHED, campaignStatus.CANCELED ].includes(
		status
	);
};

type PagedDataMode = 'campaigns' | 'posts';

type BlazeDataPaged = {
	campaigns?: Campaign[];
	posts?: BlazablePost[];
};

export const getPagedBlazeSearchData = (
	mode: PagedDataMode,
	pagedData?: InfiniteData< CampaignQueryResult | PostQueryResult >
): PagedBlazeContentData => {
	const lastPage = pagedData?.pages?.[ pagedData?.pages?.length - 1 ];

	const campaigns_stats =
		lastPage && 'campaigns_stats' in lastPage
			? lastPage.campaigns_stats
			: {
					total_impressions: 0,
					total_clicks: 0,
			  };

	if ( lastPage ) {
		const { has_more_pages, total_items, warnings, tsp_eligible = false } = lastPage;

		let foundContent: BlazePagedItem[] = pagedData?.pages
			?.map( ( item: BlazeDataPaged ) => item[ mode ] )
			?.flat()
			?.filter( ( item?: BlazePagedItem ): item is BlazePagedItem => 'undefined' !== typeof item );

		if ( foundContent?.length ) {
			switch ( mode ) {
				case 'campaigns':
					foundContent = foundContent as Campaign[];
				case 'posts':
					foundContent = foundContent as BlazablePost[];
			}
		}

		return {
			has_more_pages,
			campaigns_stats,
			total_items,
			items: foundContent,
			warnings,
			tsp_eligible,
		};
	}
	return {
		has_more_pages: false,
		total_items: 0,
		items: [],
		tsp_eligible: false,
	};
};

/**
 * Update the path by adding the advertising section URL prefix
 * @param {string} path partial URL
 * @returns pathname concatenated with the advertising configured path prefix
 */
export function getAdvertisingDashboardPath( path: string ) {
	const pathPrefix = config( 'advertising_dashboard_path_prefix' ) || '/advertising';
	return `${ pathPrefix }${ path }`;
}

export const getShortDateString = ( date: string, withTime: boolean = false ) => {
	const timestamp = moment( Date.parse( date ) );
	const now = moment();

	const minuteDiff = Math.abs( now.diff( timestamp, 'minutes' ) );
	if ( minuteDiff < 1 ) {
		return __( 'Now' );
	}

	const dateDiff = Math.abs( now.diff( timestamp, 'days' ) );
	if ( dateDiff < 7 ) {
		return timestamp.fromNow();
	}

	if ( withTime ) {
		const format = timestamp.isSame( now, 'year' )
			? // translators: Moment.js date format, `MMM` refers to short month name (e.g. `Sep`), `DD`` refers to 2-digit day of month (e.g. `05`). Wrap text [] to be displayed as is, for example `DD [de] MMM` will be formatted as `05 de sep.`. HH:mm refers to 24-hour time format (e.g. `18:00`).
			  _x( 'MMM DD, HH:mm', 'short date format' )
			: // translators: Moment.js date format, `MMM` refers to short month name (e.g. `Sep`), `DD`` refers to 2-digit day of month (e.g. `05`), `YYYY` refers to the full year format (e.g. `2023`). Wrap text [] to be displayed as is, for example `DD [de] MMM [de] YYYY` will be formatted as `05 de sep. de 2023`. HH:mm refers to 24-hour time format (e.g. `18:00`).
			  _x( 'MMM DD, YYYY HH:mm', 'short date with year format' );

		return moment( date ).format( format );
	}

	const format = timestamp.isSame( now, 'year' )
		? // translators: Moment.js date format, `MMM` refers to short month name (e.g. `Sep`), `DD`` refers to 2-digit day of month (e.g. `05`). Wrap text [] to be displayed as is, for example `DD [de] MMM` will be formatted as `05 de sep.`.
		  _x( 'MMM DD', 'short date format' )
		: // translators: Moment.js date format, `MMM` refers to short month name (e.g. `Sep`), `DD`` refers to 2-digit day of month (e.g. `05`), `YYYY` refers to the full year format (e.g. `2023`). Wrap text [] to be displayed as is, for example `DD [de] MMM [de] YYYY` will be formatted as `05 de sep. de 2023`.
		  _x( 'MMM DD, YYYY', 'short date with year format' );

	return moment( date ).format( format );
};

export const getLongDateString = ( date: string ) => {
	const timestamp = moment( Date.parse( date ) );
	// translators: "ll" refers to date (eg. 21 Apr) & "LT" refers to time (eg. 18:00) - "at" is translated
	const sameElse: string = __( 'll [at] LT' ) ?? 'll [at] LT';
	return timestamp.calendar( null, { sameElse } );
};

export const formatAmount = ( amount: number, currencyCode: string ) => {
	if ( ! amount ) {
		return undefined;
	}
	const money = getCurrencyObject( amount, currencyCode, { stripZeros: false } );
	return `${ money.symbol }${ money.integer }${ money.fraction }`;
};

export const isRunningInWpAdmin = ( site: SiteDetails | null | undefined ): boolean => {
	if ( ! site ) {
		return false;
	}
	const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );
	const isRunningInClassicSimple = site?.options?.is_wpcom_simple;
	return isRunningInClassicSimple || isRunningInJetpack;
};

export const cvsStatsDownload = ( csvData: string, fileName: string = 'report.csv' ) => {
	const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8;' } );
	const link = document.createElement( 'a' );
	link.href = URL.createObjectURL( blob );
	link.download = fileName;
	link.click();
	URL.revokeObjectURL( link.href );
};
