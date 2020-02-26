/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import config from 'config';
import EligibilityWarnings from 'blocks/eligibility-warnings';
import { FEATURE_PERFORMANCE } from 'lib/plans/constants';
import { isJetpackSite, isCurrentPlanPaid } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import isVipSite from 'state/selectors/is-vip-site';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';

export class SiteSettingsFormMakePublic extends Component {
	render() {
		const { handleSubmitForm, isSavingSettings, updateFields } = this.props;

		return (
			<>
				<EligibilityWarnings
					context="performance"
					feature={ FEATURE_PERFORMANCE }
					ctaName="calypso-performance-features-activate-nudge"
					eligibilityData={ {
						eligibilityHolds: [ 'SITE_NOT_PUBLIC' ],
					} }
					isBusy={ isSavingSettings }
					isEligible={ true }
					onProceed={ e => {
						updateFields(
							{
								blog_public: 1,
								wpcom_coming_soon: 0,
							},
							() => {
								handleSubmitForm( e );
							}
						);
					} }
					className="site-settings__card"
				/>
			</>
		);
	}
}

const connectComponent = connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );
		const selectedSite = getSelectedSite( state );

		return {
			withComingSoonOption: ownProps.hasOwnProperty( 'withComingSoonOption' )
				? ownProps.withComingSoonOption
				: config.isEnabled( 'coming-soon' ),
			isUnlaunchedSite: isUnlaunchedSite( state, siteId ),
			needsVerification: ! isCurrentUserEmailVerified( state ),
			siteIsJetpack,
			siteIsVip: isVipSite( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
			selectedSite,
			isPaidPlan: isCurrentPlanPaid( state, siteId ),
			siteDomains: getDomainsBySiteId( state, siteId ),
		};
	},
	null,
	null,
	{ pure: false }
);

const getFormSettings = settings => {
	return {
		blog_public: settings?.blog_public || '',
		wpcom_coming_soon: settings?.wpcom_coming_soon || '',
	};
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormMakePublic );
