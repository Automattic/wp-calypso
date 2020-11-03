/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';
import { union, includes, noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import page from 'page';

/**
 * Internal dependencies
 */
import {
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_PERFORMANCE,
	FEATURE_UPLOAD_THEMES,
	FEATURE_SFTP,
} from 'calypso/lib/plans/constants';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { Button, CompactCard } from '@automattic/components';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import HoldList, { hasBlockingHold } from './hold-list';
import WarningList from './warning-list';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { isSavingSiteSettings } from 'calypso/state/site-settings/selectors';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import getRequest from 'calypso/state/selectors/get-request';

/**
 * Style dependencies
 */
import './style.scss';

interface ExternalProps {
	backUrl: string;
	onProceed: () => void;
	className?: string;
	eligibilityData?: {
		eligibilityHolds: string[];
		eligibilityWarnings: string[];
		lastUpdated: string;
	};
}

type Props = ExternalProps & ReturnType< typeof mergeProps > & LocalizeProps;

export const EligibilityWarnings = ( {
	className,
	ctaName,
	context,
	feature,
	eligibilityData,
	isEligible,
	isPlaceholder,
	onProceed,
	recordUpgradeClick,
	siteId,
	siteSlug,
	siteIsLaunching,
	siteIsSavingSettings,
	launchSite: launch,
	makeSitePublic,
	translate,
}: Props ) => {
	const warnings = eligibilityData.eligibilityWarnings || [];
	const listHolds = eligibilityData.eligibilityHolds || [];

	const showWarnings = warnings.length > 0 && ! hasBlockingHold( listHolds );
	const classes = classNames(
		'eligibility-warnings',
		{
			'eligibility-warnings__placeholder': isPlaceholder,
			'eligibility-warnings--with-indent': showWarnings,
		},
		className
	);

	const launchCurrentSite = () => launch( siteId );
	const makeCurrentSitePublic = () => makeSitePublic( siteId );

	const logEventAndProceed = () => {
		if ( siteRequiresUpgrade( listHolds ) ) {
			recordUpgradeClick( ctaName, feature );
			page.redirect( `/checkout/${ siteSlug }/business` );
			return;
		}
		if ( siteRequiresLaunch( listHolds ) ) {
			launchCurrentSite();
			return;
		}
		if ( siteRequiresGoingPublic( listHolds ) ) {
			makeCurrentSitePublic();
			return;
		}
		onProceed();
	};

	const showThisSiteIsEligibleMessage =
		isEligible && 0 === listHolds.length && 0 === warnings.length;

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>

			{ ( isPlaceholder || listHolds.length > 0 ) && (
				<CompactCard>
					<HoldList context={ context } holds={ listHolds } isPlaceholder={ isPlaceholder } />
				</CompactCard>
			) }

			{ showThisSiteIsEligibleMessage && (
				<CompactCard>
					<div className="eligibility-warnings__no-conflicts">
						<Gridicon icon="thumbs-up" size={ 24 } />
						<span>{ getSiteIsEligibleMessage( context, translate ) }</span>
					</div>
				</CompactCard>
			) }

			{ showWarnings && (
				<CompactCard className="eligibility-warnings__warnings-card">
					<WarningList context={ context } warnings={ warnings } />
				</CompactCard>
			) }
			<CompactCard>
				<div className="eligibility-warnings__confirm-buttons">
					<Button
						primary={ true }
						disabled={
							isProceedButtonDisabled( isEligible, listHolds ) ||
							siteIsSavingSettings ||
							siteIsLaunching
						}
						busy={ siteIsLaunching || siteIsSavingSettings }
						onClick={ logEventAndProceed }
					>
						{ getProceedButtonText( listHolds, translate ) }
					</Button>
				</div>
			</CompactCard>
		</div>
	);
};

function getSiteIsEligibleMessage(
	context: string | null,
	translate: LocalizeProps[ 'translate' ]
) {
	switch ( context ) {
		case 'plugins':
		case 'themes':
			return translate( 'This site is eligible to install plugins and upload themes.' );
		case 'hosting':
			return translate( 'This site is eligible to activate hosting access.' );
		default:
			return translate( 'This site is eligible to continue.' );
	}
}

function getProceedButtonText( holds: string[], translate: LocalizeProps[ 'translate' ] ) {
	if ( siteRequiresUpgrade( holds ) ) {
		return translate( 'Upgrade and continue' );
	}
	if ( siteRequiresLaunch( holds ) ) {
		return translate( 'Launch your site and continue' );
	}
	if ( siteRequiresGoingPublic( holds ) ) {
		return translate( 'Make your site public and continue' );
	}

	return translate( 'Continue' );
}

function isProceedButtonDisabled( isEligible: boolean, holds: string[] ) {
	const resolvableHolds = [ 'NO_BUSINESS_PLAN', 'SITE_UNLAUNCHED', 'SITE_NOT_PUBLIC' ];
	const canHandleHoldsAutomatically = union( resolvableHolds, holds ).length === 3;
	return ! canHandleHoldsAutomatically && ! isEligible;
}

function siteRequiresUpgrade( holds: string[] ) {
	return holds.includes( 'NO_BUSINESS_PLAN' );
}

function siteRequiresLaunch( holds: string[] ) {
	return holds.includes( 'SITE_UNLAUNCHED' );
}

function siteRequiresGoingPublic( holds: string[] ) {
	return holds.includes( 'SITE_NOT_PUBLIC' );
}

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = ( state: object, ownProps: ExternalProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const eligibilityData = ownProps.eligibilityData || getEligibility( state, siteId );
	const isEligible = ownProps.isEligible || isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = ownProps.eligibilityData || !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		siteId,
		siteSlug,
		siteIsLaunching: getRequest( state, launchSite( siteId ) )?.isLoading ?? false,
		siteIsSavingSettings: isSavingSiteSettings( state, siteId ),
	};
};

const mapDispatchToProps = {
	trackProceed: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibilty_click_proceed', eventProperties ),
	recordUpgradeClick: ( ctaName: string, feature: string ) =>
		recordTracksEvent( 'calypso_banner_cta_click', {
			cta_name: ctaName,
			cta_feature: feature,
			cta_size: 'regular',
		} ),
	launchSite,
	makeSitePublic: ( selectedSiteId: number | null ) =>
		saveSiteSettings( selectedSiteId, {
			blog_public: 1,
			wpcom_coming_soon: 0,
			apiVersion: '1.4',
		} ),
};

function mergeProps(
	stateProps: ReturnType< typeof mapStateToProps >,
	dispatchProps: typeof mapDispatchToProps,
	ownProps: ExternalProps
) {
	let context: string | null = null;
	let feature = '';
	let ctaName = '';
	if ( includes( ownProps.backUrl, 'plugins' ) ) {
		context = 'plugins';
		feature = FEATURE_UPLOAD_PLUGINS;
		ctaName = 'calypso-plugin-eligibility-upgrade-nudge';
	} else if ( includes( ownProps.backUrl, 'themes' ) ) {
		context = 'themes';
		feature = FEATURE_UPLOAD_THEMES;
		ctaName = 'calypso-theme-eligibility-upgrade-nudge';
	} else if ( includes( ownProps.backUrl, 'hosting' ) ) {
		context = 'hosting';
		feature = FEATURE_SFTP;
		ctaName = 'calypso-hosting-eligibility-upgrade-nudge';
	} else if ( includes( ownProps.backUrl, 'performance' ) ) {
		context = 'performance';
		feature = FEATURE_PERFORMANCE;
		ctaName = 'calypso-performance-features-activate-nudge';
	}

	const onProceed = () => {
		ownProps.onProceed();
		dispatchProps.trackProceed( { context } );
	};

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		onProceed,
		context,
		feature,
		ctaName,
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( EligibilityWarnings ) );
