/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QuerySiteDomains from 'components/data/query-site-domains';
import EmptyContent from 'components/empty-content';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { getPrimaryDomainBySiteId } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const DomainOnly = ( { primaryDomain, hasNotice, siteId, slug, translate } ) => {
	if ( ! primaryDomain ) {
		return (
			<div>
				<QuerySiteDomains siteId={ siteId } />
				<EmptyContent
					className={ 'domain-only-site__placeholder' }
					illustration={ '/calypso/images/drake/drake-browser.svg' }
				/>
			</div>
		);
	}

	const domainName = primaryDomain.name;

	return (
		<div>
			<EmptyContent
				title={ translate( '%(domainName)s is ready when you are.', { args: { domainName } } ) }
				line={ translate( 'Start a site now to unlock everything WordPress.com can offer.' ) }
				action={ translate( 'Create Site' ) }
				actionURL={
					`/start/site-selected/?siteSlug=${ encodeURIComponent( slug ) }&siteId=${ encodeURIComponent( siteId ) }`
				}
				secondaryAction={ translate( 'Manage Domain' ) }
				secondaryActionURL={ domainManagementEdit( slug, domainName ) }
				illustration={ '/calypso/images/drake/drake-browser.svg' }
			/>
			{ hasNotice && (
				<div className="domain-only-site__settings-notice">
					{ translate( 'Your domain should start working immediately, but may be unreliable during the first 72 hours.' ) }
				</div>
			) }
		</div>
	);
};

DomainOnly.propTypes = {
	primaryDomain: PropTypes.object,
	hasNotice: PropTypes.bool.isRequired,
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired,
};

export default connect(
	( state, ownProps ) => {
		return {
			slug: getSiteSlug( state, ownProps.siteId ),
			primaryDomain: getPrimaryDomainBySiteId( state, ownProps.siteId )
		};
	}
)( localize( DomainOnly ) );
