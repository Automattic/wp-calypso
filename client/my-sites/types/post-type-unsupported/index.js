/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { getSelectedSiteId } from 'state/ui/selectors';
import { canCurrentUser } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Constants
 */

/**
 * Post types which can be configured in the Writing Site Settings for a site,
 * regardless of whether the current theme supports it.
 *
 * @type {Array}
 */
const CONFIGURABLE_TYPES = [ 'jetpack-portfolio', 'jetpack-testimonial' ];

function PostTypeUnsupported( { translate, canManage, siteSlug, type } ) {
	const isConfigurableType = includes( CONFIGURABLE_TYPES, type );

	let title, line, action, actionUrl;
	if ( isConfigurableType && canManage ) {
		switch ( type ) {
			case 'jetpack-portfolio':
				title = translate( 'Portfolios are not enabled' );
				break;

			case 'jetpack-testimonial':
				title = translate( 'Testimonials are not enabled' );
				break;
		}

		line = translate( 'Activate custom content types in your site settings' );
		action = translate( 'Manage Settings' );
		actionUrl = '/settings/writing/' + siteSlug;
	} else {
		line = translate( 'Your site does not support this content type' );
	}

	if ( ! title ) {
		title = translate( 'Content type unsupported' );
	}

	return <EmptyContent { ...{ title, line, action, actionURL: actionUrl } } />;
}

PostTypeUnsupported.propTypes = {
	translate: PropTypes.func,
	canManage: PropTypes.bool,
	siteSlug: PropTypes.string,
	type: PropTypes.string
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		canManage: canCurrentUser( state, siteId, 'manage_options' ),
		siteSlug: getSiteSlug( state, siteId )
	};
} )( localize( PostTypeUnsupported ) );
