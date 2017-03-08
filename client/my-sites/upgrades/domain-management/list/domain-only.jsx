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
	<div>
		<EmptyContent
			title={ translate( '%(domainName)s is ready when you are.', { args: { domainName } } ) }
			line={ translate( 'Start a site now to unlock everything WordPress.com can offer. Or add email and manage your domain preferences.' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent( domainName ) }&siteId=${ encodeURIComponent( siteId ) }` }
			secondaryAction={ translate( 'Manage Domain' ) }
			secondaryActionURL={ domainManagementEdit( domainName, domainName ) }
			illustration={ '/calypso/images/drake/drake-browser.svg' } />
		<div className="domain-only-site__settings-notice">
			{ translate( 'New domains usually start working immediately, but may be unreliable for the first few hours.' ) }
		</div>
	</div>
);

DomainOnly.propTypes = {
	domainName: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired,
};

export default localize( DomainOnly );
