/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import EmptyContent from 'components/empty-content';
import SidebarNavigation from 'my-sites/sidebar-navigation';

/**
 * Renders content to be displayed in response of any action not available in domain-only sites.
 */
const FeatureUnavailable = ( { domainName, siteId, translate } ) => {
	return (
		<div>
			<DocumentHead title={ translate( 'Domain Management' ) } />

			<SidebarNavigation />

			<EmptyContent
				className={ 'feature-unavailable' }
				title={ translate( 'Add a site to start using this feature.' ) }
				line={ translate( 'Your domain is only set up with a temporary page. Start a site now to unlock everything WordPress.com can offer.' ) }
				action={ translate( 'Create Site' ) }
				actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent( domainName ) }&siteId=${ encodeURIComponent( siteId ) }` }
				secondaryAction={ translate( 'Manage Domain' ) }
				secondaryActionURL={ domainManagementEdit( domainName, domainName ) } />
		</div>
	);
};

FeatureUnavailable.propTypes = {
	domainName: PropTypes.string.isRequired,
	siteId: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired
};

export default localize( FeatureUnavailable );
