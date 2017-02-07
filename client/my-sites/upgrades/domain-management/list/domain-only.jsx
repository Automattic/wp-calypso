/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { domainManagementEdit } from 'my-sites/upgrades/paths';

const DomainOnly = ( { domainName, siteId, translate } ) => (
	<EmptyContent
		title={ translate( '%(domainName)s is not set up yet.', {
			args: { domainName }
		} ) }
		action={ translate( 'Create New Site' ) }
		actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent( domainName ) }&siteId=${ encodeURIComponent( siteId ) }` }
		secondaryAction={ translate( 'Advanced' ) }
		secondaryActionURL={ domainManagementEdit( domainName, domainName ) }
		illustration={ '/calypso/images/drake/drake-browser.svg' } />
);

DomainOnly.propTypes = {
	domainName: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( DomainOnly );
