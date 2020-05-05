/**
 * External dependencies
 */
import cookie from 'cookie';
import debugFactory from 'debug';
import { pushEventToTracksQueue } from '@automattic/calypso-analytics';

/**
 * Internal dependencies.
 */
import { urlParseAmpCompatible } from 'lib/analytics/utils';

/**
 * Const variables.
 */
const debug = debugFactory( 'calypso:analytics:sem' );
const UTM_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const MAX_UTM_LENGTH = 128;
const MAX_URL_PARAM_VALUE_LENGTH = 50;
const MAX_KEYWORD_PARAM_VALUE_LENGTH = 80;
const MAX_GCLID_PARAM_VALUE_LENGTH = 100;
// These are the URL params that end up in the `ad_details` cookie
const URL_PARAM_WHITELIST = [
	'adgroupid',
	'campaignid',
	'device',
	'gclid',
	'gclsrc',
	'fbclid',
	'keyword',
	'matchtype',
	'network',
	'type',
	'term',
	'utm_campaign',
	'utm_content',
	'utm_medium',
	'utm_source',
	'utm_term',
	'targetid', // QuanticMind
	'locationid', // QuanticMind
	'ref',
	'format', // amp/non-amp
];
const VALID_UTM_SOURCE_CAMPAIGN = new RegExp( '^[a-zA-Z\\d_\\-]{1,' + MAX_UTM_LENGTH + '}$' );

function isValidUtmSourceOrCampaign( value ) {
	return VALID_UTM_SOURCE_CAMPAIGN.test( value );
}

function isValidOtherUrlParamValue( key, value ) {
	if ( 'gclid' === key ) {
		return value.length <= MAX_GCLID_PARAM_VALUE_LENGTH;
	} else if ( 'keyword' === key ) {
		return value.length <= MAX_KEYWORD_PARAM_VALUE_LENGTH;
	}

	return value.length <= MAX_URL_PARAM_VALUE_LENGTH;
}

function isValidWhitelistedUrlParamValue( key, value ) {
	if ( -1 === URL_PARAM_WHITELIST.indexOf( key ) ) {
		return false;
	} else if ( 'utm_source' === key || 'utm_campaign' === value ) {
		return isValidUtmSourceOrCampaign( value );
	}

	return isValidOtherUrlParamValue( key, value );
}

function setUtmCookie( name, value ) {
	document.cookie = cookie.serialize( name, value, {
		path: '/',
		maxAge: UTM_COOKIE_MAX_AGE,
		// NOTE: Domains having more than a single extension (e.g., example.us.com)
		// would require additional custom logic to work out the root domain name.
		domain: '.' + document.location.hostname.split( '.' ).slice( -2 ).join( '.' ),
	} );
}

/**
 * Updates tracking based on URL query parameters.
 */
export function updateQueryParamsTracking() {
	if ( ! document.location.search ) {
		debug( 'No query data in URL.' );
		return;
	}

	const searchParams = urlParseAmpCompatible( document.location.href )?.searchParams;

	// Sanitize query params
	let sanitizedQuery = new URLSearchParams();

	if ( searchParams ) {
		const validEntries = Array.from( searchParams.entries() ).filter( ( [ key, value ] ) =>
			isValidWhitelistedUrlParamValue( key, value )
		);
		sanitizedQuery = new URLSearchParams( validEntries );

		// Cross domain tracking for AMP.
		if ( searchParams.get( 'amp_client_id' ) ) {
			pushEventToTracksQueue( [ 'identifyAnonUser', searchParams.get( 'amp_client_id' ) ] );
		}
	}

	// Drop SEM cookie update if either of these is missing
	if ( ! sanitizedQuery.get( 'utm_source' ) || ! sanitizedQuery.get( 'utm_campaign' ) ) {
		debug( 'Missing utm_source or utm_campaign.' );
		return;
	}

	// Regenerate sanitized query string
	const sanitizedQueryString = sanitizedQuery.toString();

	if ( sanitizedQueryString ) {
		debug( 'ad_details: ' + sanitizedQueryString );
		setUtmCookie( 'ad_details', sanitizedQueryString );
		setUtmCookie( 'ad_timestamp', Math.floor( new Date().getTime() / 1000 ) );
	}
}
