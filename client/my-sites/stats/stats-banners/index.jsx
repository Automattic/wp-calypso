/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { isEcommercePlan } from 'lib/plans';
import config from 'config';
import ECommerceManageNudge from 'blocks/ecommerce-manage-nudge';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getEligibleGSuiteDomain } from 'lib/gsuite';
import { getSitePlanSlug } from 'state/sites/selectors';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business-stats-nudge';
import GSuiteStatsNudge from 'blocks/gsuite-stats-nudge';
import isGoogleMyBusinessStatsNudgeVisibleSelector from 'state/selectors/is-google-my-business-stats-nudge-visible';
import isGSuiteStatsNudgeVisible from 'state/selectors/is-gsuite-stats-nudge-visible';
import isUpworkStatsNudgeDismissed from 'state/selectors/is-upwork-stats-nudge-dismissed';
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import QuerySiteDomains from 'components/data/query-site-domains';
import UpworkStatsNudge from 'blocks/upwork-stats-nudge';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';
import QueryEmailForwards from 'components/data/query-email-forwards';
import canCurrentUser from 'state/selectors/can-current-user';

class StatsBanners extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		gsuiteDomainName: PropTypes.string,
		isCustomerHomeEnabled: PropTypes.bool.isRequired,
		isAllowedToManageSite: PropTypes.bool.isRequired,
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
			this.props.gsuiteDomainName !== nextProps.gsuiteDomainName
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
		const { isGoogleMyBusinessStatsNudgeVisible, siteId, slug, primaryButton } = this.props;

		return (
			<GoogleMyBusinessStatsNudge
				siteSlug={ slug }
				siteId={ siteId }
				visible={ isGoogleMyBusinessStatsNudgeVisible }
				primaryButton={ primaryButton }
			/>
		);
	}

	renderGSuiteBanner() {
		const { gsuiteDomainName, siteId, slug, primaryButton } = this.props;

		return (
			<GSuiteStatsNudge
				siteSlug={ slug }
				siteId={ siteId }
				domainSlug={ gsuiteDomainName }
				primaryButton={ primaryButton }
			/>
		);
	}

	renderUpworkBanner() {
		const { siteId, slug, primaryButton } = this.props;

		return <UpworkStatsNudge siteSlug={ slug } siteId={ siteId } primaryButton={ primaryButton } />;
	}

	showGoogleMyBusinessBanner() {
		return (
			config.isEnabled( 'google-my-business' ) && this.props.isGoogleMyBusinessStatsNudgeVisible
		);
	}

	showGSuiteBanner() {
		return this.props.isGSuiteStatsNudgeVisible;
	}

	showUpworkBanner() {
		return (
			abtest( 'builderReferralStatsNudge' ) === 'builderReferralBanner' &&
			this.props.isUpworkStatsNudgeVisible
		);
	}

	render() {
		const {
			gsuiteDomainName,
			isCustomerHomeEnabled,
			isAllowedToManageSite,
			planSlug,
			siteId,
			domains,
		} = this.props;

		if ( isEmpty( domains ) ) {
			return null;
		}

		return (
			<Fragment>
				{ gsuiteDomainName && isAllowedToManageSite && (
					<QueryEmailForwards domainName={ gsuiteDomainName } />
				) }

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
	const domains = getDomainsBySiteId( state, ownProps.siteId );

	return {
		domains,
		gsuiteDomainName: getEligibleGSuiteDomain( null, domains ),
		isCustomerHomeEnabled: canCurrentUserUseCustomerHome( state, ownProps.siteId ),
		isAllowedToManageSite: canCurrentUser( state, ownProps.siteId, 'manage_options' ),
		isGoogleMyBusinessStatsNudgeVisible: isGoogleMyBusinessStatsNudgeVisibleSelector(
			state,
			ownProps.siteId
		),
		isGSuiteStatsNudgeVisible: isGSuiteStatsNudgeVisible( state, ownProps.siteId, domains ),
		isUpworkStatsNudgeVisible: ! isUpworkStatsNudgeDismissed( state, ownProps.siteId ),
		planSlug: getSitePlanSlug( state, ownProps.siteId ),
	};
} )( localize( StatsBanners ) );
