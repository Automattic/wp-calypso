/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, get, includes, noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import { findFirstSimilarPlanKey } from 'lib/plans';
import { FEATURE_UPLOAD_PLUGINS, FEATURE_UPLOAD_THEMES, TYPE_BUSINESS } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { getSitePlan, isJetpackSite } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Banner from 'components/banner';
import Button from 'components/button';
import Card from 'components/card';
import QueryEligibility from 'components/data/query-atat-eligibility';
import HoldList from './hold-list';
import WarningList from './warning-list';

/**
 * Style dependencies
 */
import './style.scss';

export const EligibilityWarnings = ( {
	backUrl,
	context,
	eligibilityData,
	hasBusinessPlan,
	isEligible,
	isJetpack,
	isVip,
	isPlaceholder,
	onProceed,
	onCancel,
	siteId,
	sitePlan,
	siteSlug,
	translate,
} ) => {
	const warnings = get( eligibilityData, 'eligibilityWarnings', [] );

	const listHolds = filter(
		get( eligibilityData, 'eligibilityHolds', [] ),
		hold => ! includes( [ 'NO_BUSINESS_PLAN', 'NOT_USING_CUSTOM_DOMAIN' ], hold )
	);

	const classes = classNames( 'eligibility-warnings', {
		'eligibility-warnings__placeholder': isPlaceholder,
	} );

	let businessUpsellBanner = null;
	if ( ! hasBusinessPlan && ! isJetpack && ! isVip ) {
		const description = translate(
			'Also get unlimited themes, advanced customization, no ads, live chat support, and more.'
		);
		const title = translate( 'Business plan required' );
		const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
			type: TYPE_BUSINESS,
		} );
		let feature = null;
		let event = null;

		if ( 'plugins' === context ) {
			feature = FEATURE_UPLOAD_PLUGINS;
			event = 'calypso-plugin-eligibility-upgrade-nudge';
		} else {
			feature = FEATURE_UPLOAD_THEMES;
			event = 'calypso-theme-eligibility-upgrade-nudge';
		}

		const bannerURL = `/checkout/${ siteSlug }/business`;
		businessUpsellBanner = (
			<Banner
				description={ description }
				feature={ feature }
				event={ event }
				plan={ plan }
				title={ title }
				href={ bannerURL }
			/>
		);
	}

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>
			{ businessUpsellBanner }

			{ ( isPlaceholder || listHolds.length > 0 ) && (
				<HoldList holds={ listHolds } isPlaceholder={ isPlaceholder } siteSlug={ siteSlug } />
			) }
			{ warnings.length > 0 && <WarningList warnings={ warnings } /> }

			{ isEligible && 0 === listHolds.length && 0 === warnings.length && (
				<Card className="eligibility-warnings__no-conflicts">
					<Gridicon icon="thumbs-up" size={ 24 } />
					<span>
						{ translate( 'This site is eligible to install plugins and upload themes.' ) }
					</span>
				</Card>
			) }

			<Card className="eligibility-warnings__confirm-box">
				<div className="eligibility-warnings__confirm-text">
					{ ! isEligible && (
						<>
							{ translate( 'Please clear all issues above to proceed.' ) }
							&nbsp;
						</>
					) }
					{ isEligible && warnings.length > 0 && (
						<>
							{ translate( 'If you proceed you will no longer be able to use these features. ' ) }
							&nbsp;
						</>
					) }
					{ translate( 'Questions? {{a}}Contact support{{/a}} for help.', {
						components: {
							a: (
								<a
									href="https://wordpress.com/help/contact"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					} ) }
				</div>
				<div className="eligibility-warnings__confirm-buttons">
					<Button href={ backUrl } onClick={ onCancel }>
						{ translate( 'Cancel' ) }
					</Button>

					<Button primary={ true } disabled={ ! isEligible } onClick={ onProceed }>
						{ translate( 'Proceed' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
};

EligibilityWarnings.propTypes = {
	onProceed: PropTypes.func,
	backUrl: PropTypes.string,
	translate: PropTypes.func,
};

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const eligibilityHolds = get( eligibilityData, 'eligibilityHolds', [] );
	const hasBusinessPlan = ! includes( eligibilityHolds, 'NO_BUSINESS_PLAN' );
	const isJetpack = isJetpackSite( state, siteId );
	const isVip = isVipSite( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;
	const sitePlan = getSitePlan( state, siteId );

	return {
		eligibilityData,
		hasBusinessPlan,
		isEligible,
		isJetpack,
		isVip,
		isPlaceholder: ! dataLoaded,
		siteId,
		siteSlug,
		sitePlan,
	};
};

const mapDispatchToProps = {
	trackCancel: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibility_click_cancel', eventProperties ),
	trackProceed: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibilty_click_proceed', eventProperties ),
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	let context;
	if ( includes( ownProps.backUrl, 'plugins' ) ) {
		context = 'plugins';
	} else if ( includes( ownProps.backUrl, 'themes' ) ) {
		context = 'themes';
	} else if ( includes( ownProps.backUrl, 'hosting' ) ) {
		context = 'hosting';
	}

	const onCancel = () => dispatchProps.trackCancel( { context } );
	const onProceed = () => {
		ownProps.onProceed();
		dispatchProps.trackProceed( { context } );
	};
	return Object.assign( {}, ownProps, stateProps, dispatchProps, { onCancel, onProceed, context } );
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( EligibilityWarnings ) );
