/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { Banner } from 'components/banner';
import { SETTING_PRIMARY_DOMAIN } from 'lib/url/support';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';

const NonPrimaryDomainPlanUpsell = ( {
	domain,
	hasNonPrimaryDomainsFlag,
	isDomainOnly,
	selectedSite,
	translate,
	tracksImpressionName,
	tracksClickName,
} ) => {
	if (
		! hasNonPrimaryDomainsFlag ||
		isDomainOnly ||
		! domain.pointsToWpcom ||
		domain.isPrimary ||
		domain.isWPCOMDomain ||
		domain.isWpcomStagingDomain
	) {
		return null;
	}

	return (
		<Banner
			title={ translate( 'This domain is being forwarded to %(primaryDomain)s', {
				args: {
					primaryDomain: selectedSite.slug,
				},
			} ) }
			description={ translate(
				'Upgrade to a paid plan to make {{strong}}%(domain)s{{/strong}} the primary address that your ' +
					'visitors see when they visit your site. {{a}}Learn more{{/a}}',
				{
					args: {
						domain: domain.name,
					},
					components: {
						a: <a href={ SETTING_PRIMARY_DOMAIN } target="_blank" rel="noopener noreferrer" />,
						strong: <strong />,
					},
				}
			) }
			callToAction={ translate( 'Upgrade' ) }
			tracksImpressionName={ tracksImpressionName }
			tracksClickName={ tracksClickName }
			event="calypso_non_primary_domain_plan_upsell"
		/>
	);
};

const mapStateToProps = state => {
	return {
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
	};
};

export default connect( mapStateToProps )( localize( NonPrimaryDomainPlanUpsell ) );
