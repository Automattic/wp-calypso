import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Illustration from 'calypso/assets/images/customer-home/illustration--task-find-domain.svg';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import { canCurrentUserCreateSiteFromDomainOnly } from 'calypso/lib/domains';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementEdit, createSiteFromDomainOnly } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { getSiteSlug } from 'calypso/state/sites/selectors';

import './domain-only.scss';

const DomainOnly = ( { primaryDomain, hasNotice, recordTracks, siteId, slug, translate } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	if ( ! primaryDomain ) {
		return (
			<div>
				<QuerySiteDomains siteId={ siteId } />
				<EmptyContent className="domain-only-site__placeholder" illustration={ Illustration } />
			</div>
		);
	}

	const hasEmailWithUs = hasGSuiteWithUs( primaryDomain ) || hasTitanMailWithUs( primaryDomain );
	const domainName = primaryDomain.name;
	const canCreateSite = canCurrentUserCreateSiteFromDomainOnly( primaryDomain );
	const createSiteUrl = createSiteFromDomainOnly( slug, siteId );

	const recordEmailClick = () => {
		const tracksName = hasEmailWithUs
			? 'calypso_domain_only_email_manage'
			: 'calypso_domain_only_email_cta';
		recordTracks( tracksName, {
			domain: domainName,
		} );
	};

	return (
		<div>
			<EmptyContent
				title={ translate( '%(domainName)s is ready when you are.', { args: { domainName } } ) }
				line={
					canCreateSite &&
					translate( 'Start a site now to unlock everything WordPress.com can offer.' )
				}
				action={ canCreateSite && translate( 'Create site' ) }
				actionURL={ canCreateSite && createSiteUrl }
				secondaryAction={ translate( 'Manage domain' ) }
				secondaryActionURL={ domainManagementEdit( slug, domainName ) }
				illustration={ Illustration }
			>
				<Button
					className="empty-content__action button"
					href={ emailManagement( slug, domainName ) }
					onClick={ recordEmailClick }
				>
					{ hasEmailWithUs ? translate( 'Manage email' ) : translate( 'Add email' ) }
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
