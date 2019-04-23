/** @format */

/**
 * External dependencies
 */

import { get, find, each } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import createSelector from 'lib/create-selector';
import { getVerticals } from 'state/signup/verticals/selectors';
import { getSignupSitePreviewLastShown } from 'state/signup/site-preview/selectors';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';

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

	return {
		isUserInputVertical: true,
		parent: '',
		preview: '',
		verticalId: '',
		verticalName,
		verticalSlug: verticalName,
	};
}

export function getSiteVerticalPreview( state ) {
	return get( getSiteVerticalData( state ), 'preview', '' );
}

export const getSiteVerticalPreviewIframeContent = createSelector(
	state => {
		debug( 'deriving site vertical preview iframe content' );
		let body = getSiteVerticalPreview( state );
		if ( ! body ) {
			return {};
		}
		const title = getSiteTitle( state );

		if ( 'string' === typeof body ) {
			each(
				{
					CompanyName: title || translate( 'Your New Website' ),
					Address: translate( 'Your Address' ),
					Phone: translate( 'Your Phone Number' ),
				},
				( value, key ) => ( body = body.replace( new RegExp( '{{' + key + '}}', 'gi' ), value ) )
			);
		}

		return {
			body,
			title,
			tagline: translate( 'You’ll be able to customize this to your needs.' ),
		};
	},
	state => [ getSiteTitle( state ), getSignupSitePreviewLastShown( state ) ]
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
