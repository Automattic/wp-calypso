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

const DomainOnly = ( { domainName, hasNotice, siteId, translate } ) => (
	<div>
		<EmptyContent
			title={ translate( '%(domainName)s is ready when you are.', { args: { domainName } } ) }
			line={ translate( 'Start a site now to unlock everything WordPress.com can offer.' ) }
			action={ translate( 'Create Site' ) }
			actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent( domainName ) }&siteId=${ encodeURIComponent( siteId ) }` }
			secondaryAction={ translate( 'Manage Domain' ) }
			secondaryActionURL={ domainManagementEdit( domainName, domainName ) }
			illustration={ '/calypso/images/drake/drake-browser.svg' } />
		{ hasNotice && (
			<div className="domain-only-site__settings-notice">
				{ translate( 'Your domain should start working immediately, but may be unreliable during the first 72 hours.' ) }
			</div>
		) }
	</div>
);

DomainOnly.propTypes = {
	domainName: PropTypes.string.isRequired,
	hasNotice: PropTypes.bool.isRequired,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired,
};

export default localize( DomainOnly );
