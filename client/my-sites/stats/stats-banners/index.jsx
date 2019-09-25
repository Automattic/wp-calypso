/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { isEcommercePlan } from 'lib/plans';
import config from 'config';
import ECommerceManageNudge from 'blocks/ecommerce-manage-nudge';
import { getSitePlanSlug } from 'state/sites/selectors';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getGSuiteSupportedDomains, hasGSuite, hasGSuiteOtherProvidor } from 'lib/gsuite';
import { getEmailForwardingTypeForDomains } from 'state/selectors/get-email-forwarding-type';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business-stats-nudge';
import GSuiteStatsNudge from 'blocks/gsuite-stats-nudge';
import isGoogleMyBusinessStatsNudgeVisibleSelector from 'state/selectors/is-google-my-business-stats-nudge-visible';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';
import isUpworkStatsNudgeDismissed from 'state/selectors/is-upwork-stats-nudge-dismissed';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import QuerySiteDomains from 'components/data/query-site-domains';
import UpworkStatsNudge from 'blocks/upwork-stats-nudge';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import QueryEmailForwards from 'components/data/query-email-forwards';

class StatsBanners extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		isCustomerHomeEnabled: PropTypes.bool.isRequired,
		isGoogleMyBusinessStatsNudgeVisible: PropTypes.bool.isRequired,
		isGSuiteStatsNudgeVisible: PropTypes.bool.isRequired,
		isUpworkStatsNudgeVisible: PropTypes.bool.isRequired,
		planSlug: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		slug: PropTypes.string.isRequired,
	};

	shouldComponentUpdate( nextProps ) {
		return (
			this.props.isGSuiteStatsNudgeVisible !== nextProps.isGSuiteStatsNudgeVisible ||
			this.props.isUpworkStatsNudgeVisible !== nextProps.isUpworkStatsNudgeVisible ||
			this.props.isGoogleMyBusinessStatsNudgeVisible !==
				nextProps.isGoogleMyBusinessStatsNudgeVisible ||
			this.props.domains.length !== nextProps.domains.length ||
			! isEqual( this.props.emailForwardingTypes, nextProps.emailForwardingTypes )
		);
	}

	renderBanner() {
		if ( this.showUpworkBanner() ) {
			return this.renderUpworkBanner();
		} else if ( this.showGSuiteBanner() ) {
			return this.renderGSuiteBanner();
		} else if ( this.showGoogleMyBusinessBanner() ) {
			return this.renderGoogleMyBusinessBanner();
		}
	}

	renderGoogleMyBusinessBanner() {
		const { isGoogleMyBusinessStatsNudgeVisible, siteId, slug } = this.props;
		return (
			<GoogleMyBusinessStatsNudge
				siteSlug={ slug }
				siteId={ siteId }
				visible={ isGoogleMyBusinessStatsNudgeVisible }
			/>
		);
	}

	renderGSuiteBanner() {
		const { domains, siteId, slug } = this.props;
		const domainSlug = getGSuiteSupportedDomains( domains )[ 0 ].name;
		return <GSuiteStatsNudge siteSlug={ slug } siteId={ siteId } domainSlug={ domainSlug } />;
	}

	renderUpworkBanner() {
		const { siteId, slug } = this.props;
		return <UpworkStatsNudge siteSlug={ slug } siteId={ siteId } />;
	}

	showGoogleMyBusinessBanner() {
		return (
			config.isEnabled( 'google-my-business' ) && this.props.isGoogleMyBusinessStatsNudgeVisible
		);
	}

	showGSuiteBanner() {
		const { domains, emailForwardingTypes } = this.props;
		const supportedDomains = getGSuiteSupportedDomains( domains );

		return (
			this.props.isGSuiteStatsNudgeVisible &&
			supportedDomains.length > 0 &&
			! (
				hasGSuite( supportedDomains[ 0 ] ) ||
				hasGSuiteOtherProvidor( supportedDomains[ 0 ] ) ||
				emailForwardingTypes[ supportedDomains[ 0 ].name ]
			)
		);
	}

	showUpworkBanner() {
		return (
			abtest( 'builderReferralStatsNudge' ) === 'builderReferralBanner' &&
			this.props.isUpworkStatsNudgeVisible
		);
	}

	render() {
		const { isCustomerHomeEnabled, planSlug, siteId } = this.props;
		if ( ! this.props.domains.length ) {
			return null;
		}

		return (
			<Fragment>
				{ this.props.domains.map( domain => (
					<QueryEmailForwards domainName={ domain.name } key={ domain.name } />
				) ) }
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ /* Hide `WpcomChecklist` on the Customer Home because the checklist is displayed on the page. */ }
				{ ! isEcommercePlan( planSlug ) && ! isCustomerHomeEnabled && (
					<WpcomChecklist viewMode="banner" />
				) }
				{ isEcommercePlan( planSlug ) && <ECommerceManageNudge siteId={ siteId } /> }
				{ this.renderBanner() }
			</Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const domains = getDecoratedSiteDomains( state, ownProps.siteId );

	return {
		domains,
		emailForwardingTypes: getEmailForwardingTypeForDomains(
			state,
			getGSuiteSupportedDomains( domains ),
			true
		),
		isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, ownProps.siteId ),
		isGoogleMyBusinessStatsNudgeVisible: isGoogleMyBusinessStatsNudgeVisibleSelector(
			state,
			ownProps.siteId
		),
		isGSuiteStatsNudgeVisible: ! isGSuiteStatsNudgeDismissed( state, ownProps.siteId ),
		isUpworkStatsNudgeVisible: ! isUpworkStatsNudgeDismissed( state, ownProps.siteId ),
		planSlug: getSitePlanSlug( state, ownProps.siteId ),
	};
} )( localize( StatsBanners ) );
