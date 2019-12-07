/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import config from 'config';
import ECommerceManageNudge from 'blocks/ecommerce-manage-nudge';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getGSuiteSupportedDomains, hasGSuite } from 'lib/gsuite';
import GoogleMyBusinessStatsNudge from 'blocks/google-my-business-stats-nudge';
import GSuiteStatsNudge from 'blocks/gsuite-stats-nudge';
import isGoogleMyBusinessStatsNudgeVisibleSelector from 'state/selectors/is-google-my-business-stats-nudge-visible';
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';
import isUpworkStatsNudgeDismissed from 'state/selectors/is-upwork-stats-nudge-dismissed';
import QuerySiteDomains from 'components/data/query-site-domains';
import UpworkStatsNudge from 'blocks/upwork-stats-nudge';
import WpcomChecklist from 'my-sites/checklist/wpcom-checklist';

class StatsBanners extends Component {
	static propTypes = {
		isGoogleMyBusinessStatsNudgeVisible: PropTypes.bool.isRequired,
		isGSuiteStatsNudgeVisible: PropTypes.bool.isRequired,
		isUpworkStatsNudgeVisible: PropTypes.bool.isRequired,
		siteId: PropTypes.number.isRequired,
		slug: PropTypes.string.isRequired,
	};

	shouldComponentUpdate( nextProps ) {
		if (
			this.props.isGSuiteStatsNudgeVisible !== nextProps.isGSuiteStatsNudgeVisible ||
			this.props.isUpworkStatsNudgeVisible !== nextProps.isUpworkStatsNudgeVisible ||
			this.props.isGoogleMyBusinessStatsNudgeVisible !==
				nextProps.isGoogleMyBusinessStatsNudgeVisible ||
			this.props.domains.length !== nextProps.domains.length
		) {
			return true;
		}
		return false;
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
		const { domains } = this.props;
		const supportedDomains = getGSuiteSupportedDomains( domains );
		return (
			this.props.isGSuiteStatsNudgeVisible &&
			supportedDomains.length > 0 &&
			supportedDomains.filter( function( domain ) {
				return hasGSuite( domain );
			} ).length === 0
		);
	}

	showUpworkBanner() {
		return (
			abtest( 'builderReferralStatsNudge' ) === 'builderReferralBanner' &&
			this.props.isUpworkStatsNudgeVisible
		);
	}

	render() {
		const { planSlug, siteId } = this.props;
		if ( ! this.props.domains.length ) {
			return null;
		}

		return (
			<Fragment>
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ 'ecommerce-bundle' !== planSlug && <WpcomChecklist viewMode="banner" /> }
				{ 'ecommerce-bundle' === planSlug && <ECommerceManageNudge siteId={ siteId } /> }
				{ this.renderBanner() }
			</Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		domains: getDecoratedSiteDomains( state, ownProps.siteId ),
		isGoogleMyBusinessStatsNudgeVisible: isGoogleMyBusinessStatsNudgeVisibleSelector(
			state,
			ownProps.siteId
		),
		isGSuiteStatsNudgeVisible: ! isGSuiteStatsNudgeDismissed( state, ownProps.siteId ),
		isUpworkStatsNudgeVisible: ! isUpworkStatsNudgeDismissed( state, ownProps.siteId ),
	};
} )( localize( StatsBanners ) );
