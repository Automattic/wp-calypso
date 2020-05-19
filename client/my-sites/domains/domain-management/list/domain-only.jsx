/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import EmptyContent from 'components/empty-content';
import { hasGSuiteWithUs } from 'lib/gsuite';
import QuerySiteDomains from 'components/data/query-site-domains';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { emailManagement } from 'my-sites/email/paths';
import getPrimaryDomainBySiteId from 'state/selectors/get-primary-domain-by-site-id';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './domain-only.scss';

const DomainOnly = ( { primaryDomain, hasNotice, recordTracks, siteId, slug, translate } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	if ( ! primaryDomain ) {
		return (
			<div>
				<QuerySiteDomains siteId={ siteId } />
				<EmptyContent
					className="domain-only-site__placeholder"
					illustration={ '/calypso/images/drake/drake-browser.svg' }
				/>
			</div>
		);
	}

	const domainName = primaryDomain.name;
	const domainHasGSuiteWithUs = hasGSuiteWithUs( primaryDomain );

	const recordEmailClick = () => {
		const tracksName = domainHasGSuiteWithUs
			? 'calypso_domain_only_gsuite_manage'
			: 'calypso_domain_only_gsuite_cta';
		recordTracks( tracksName, {
			domain: domainName,
		} );
	};

	return (
		<div>
			<EmptyContent
				title={ translate( '%(domainName)s is ready when you are.', { args: { domainName } } ) }
				line={ translate( 'Start a site now to unlock everything WordPress.com can offer.' ) }
				action={ translate( 'Create site' ) }
				actionURL={ `/start/site-selected/?siteSlug=${ encodeURIComponent(
					slug
				) }&siteId=${ encodeURIComponent( siteId ) }` }
				secondaryAction={ translate( 'Manage domain' ) }
				secondaryActionURL={ domainManagementEdit( slug, domainName ) }
				illustration={ '/calypso/images/drake/drake-browser.svg' }
			>
				<Button
					className="empty-content__action button"
					href={ emailManagement( slug, domainName ) }
					primary={ ! domainHasGSuiteWithUs }
					onClick={ recordEmailClick }
				>
					{ domainHasGSuiteWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
				</Button>
			</EmptyContent>

			{ hasNotice && (
				<div className="domain-only-site__settings-notice">
					{ translate(
						'Your domain should start working immediately, but may be unreliable during the first 30 minutes.'
					) }
				</div>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
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
			primaryDomain: getPrimaryDomainBySiteId( state, ownProps.siteId ),
		};
	},
	{ recordTracks: recordTracksEvent }
)( localize( DomainOnly ) );
