/** @format */

/**
 * External dependencies
 */

import { get, find, each, isEmpty } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { formatAddress } from './utils';
import { translate } from 'i18n-calypso';
import createSelector from 'lib/create-selector';
import { getVerticals } from 'state/signup/verticals/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { DEFAULT_VERTICAL_KEY } from 'state/signup/verticals/constants';

const debug = debugFactory( 'calypso:signup:steps:site-vertical:selectors' );

export function getSiteVerticalName( state ) {
	return get( state, 'signup.steps.siteVertical.name', '' );
}

export function getSiteVerticalData( state ) {
	const verticalName = getSiteVerticalName( state );
	const verticals = getVerticals( state, verticalName );

	const match = find(
		verticals,
		item => item.verticalName.toLowerCase() === verticalName.toLowerCase()
	);

	if ( match ) {
		return match;
	}

	const defaultVerticalData = get( verticals, [ DEFAULT_VERTICAL_KEY, 0 ], {} );

	return {
		isUserInputVertical: true,
		parent: '',
		preview: defaultVerticalData.preview || '',
		verticalId: '',
		verticalName,
		verticalSlug: verticalName,
	};
}

export function getSiteVerticalPreview( state ) {
	return get( getSiteVerticalData( state ), 'preview', '' );
}

export const getSiteVerticalPreviewLastShown = state => get( state, 'signup.siteMockupShown' );

export const getSiteVerticalPreviewTagline = state => {
	const { address, phone } = getSiteInformation( state );

	const hasAddress = ! isEmpty( address );
	const hasPhone = ! isEmpty( phone );

	if ( ! hasAddress && ! hasPhone ) {
		return translate( 'You’ll be able to customize this to your needs.' );
	}

	return [
		hasAddress ? formatAddress( address ) : '',
		hasAddress && hasPhone ? ' &middot; ' : '',
		hasPhone ? phone : '',
	].join( '' );
};

export const getSiteVerticalPreviewIframeContent = createSelector(
	state => {
		debug( 'deriving site vertical preview iframe content' );
		let body = getSiteVerticalPreview( state );
		if ( ! body ) {
			return {};
		}

		const { title, address, phone } = getSiteInformation( state );

		if ( 'string' === typeof body ) {
			each(
				{
					title,
					Address: formatAddress( address ) || translate( 'Your Address' ),
					Phone: phone || translate( 'Your Phone Number' ),
				},
				( value, key ) => ( body = body.replace( new RegExp( '{{' + key + '}}', 'gi' ), value ) )
			);
		}

		return {
			body,
			title,
			tagline: getSiteVerticalPreviewTagline( state ),
		};
	},
	state => [ getSiteInformation( state ), getSiteVerticalPreviewLastShown( state ) ]
);

// TODO: All the following selectors will be updated to use getSiteVerticalData like getSiteVerticalPreview() does.
export function getSiteVerticalId( state ) {
	return get( state, 'signup.steps.siteVertical.id', '' );
}

export function getSiteVerticalParentId( state ) {
	return get( state, 'signup.steps.siteVertical.parentId', '' );
}

export function getSiteVerticalSlug( state ) {
	return get( state, 'signup.steps.siteVertical.slug', '' );
}

export function getSiteVerticalIsUserInput( state ) {
	return get( state, 'signup.steps.siteVertical.isUserInput', true );
}
