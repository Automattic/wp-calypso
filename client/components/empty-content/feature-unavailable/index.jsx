/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import EmptyContent from 'components/empty-content';

const FeatureUnavailable = ( { selectedSite, translate } ) => {
	return (
		<EmptyContent
			className={ 'feature-unavailable' }
			title={ translate( 'Add a site to start using this feature.' ) }
			line={ translate( 'Your domain is only set up with a temporary page. Start a site now to unlock everything WordPress.com can offer.' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent( selectedSite.slug ) }&siteId=${ encodeURIComponent( selectedSite.ID ) }` }
			secondaryAction={ translate( 'Manage Domain' ) }
			secondaryActionURL={ domainManagementEdit( selectedSite.slug ) } />
	);
};

FeatureUnavailable.propTypes = {
	selectedSite: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired
};

export default localize( FeatureUnavailable );
