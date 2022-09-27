import {
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_PERFORMANCE,
	FEATURE_UPLOAD_THEMES,
	FEATURE_SFTP,
	FEATURE_INSTALL_PLUGINS,
	PLAN_BUSINESS,
	PLAN_WPCOM_PRO,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { Button, CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { localize, LocalizeProps } from 'i18n-calypso';
import { includes } from 'lodash';
import page from 'page';
import { connect, useSelector } from 'react-redux';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import ExternalLink from 'calypso/components/external-link';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import getRequest from 'calypso/state/selectors/get-request';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { isSavingSiteSettings } from 'calypso/state/site-settings/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import HoldList, { hasBlockingHold } from './hold-list';
import { isAtomicSiteWithoutBusinessPlan } from './utils';
import WarningList from './warning-list';
import type { EligibilityData } from 'calypso/state/automated-transfer/selectors';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface ExternalProps {
	isEligible?: boolean;
	backUrl: string;
	onProceed: () => void;
	standaloneProceed: boolean;
	className?: string;
	eligibilityData?: EligibilityData;
	currentContext?: string;
	isMarketplace?: boolean;
}

type Props = ExternalProps & ReturnType< typeof mergeProps > & LocalizeProps;

export const EligibilityWarnings = ( {
	className,
	ctaName,
	context,
	feature,
	eligibilityData,
	isEligible,
	isMarketplace,
	isPlaceholder,
	onProceed,
	standaloneProceed,
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

	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, siteId || undefined )
	);

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
		if ( standaloneProceed ) {
			onProceed();
			return;
		}
		if ( siteRequiresUpgrade( listHolds ) ) {
			recordUpgradeClick( ctaName, feature );
			const planSlug = eligibleForProPlan ? PLAN_WPCOM_PRO : PLAN_BUSINESS;
			page.redirect( `/checkout/${ siteSlug }/${ planSlug }` );
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
					<HoldList
						context={ context }
						holds={ listHolds }
						isPlaceholder={ isPlaceholder }
						isMarketplace={ isMarketplace }
					/>
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
					<WarningList context={ context } warnings={ warnings } showContact={ false } />
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
					<div className="support-block">
						<span>{ translate( 'Need help?' ) }</span>
						<ExternalLink
							href={ localizeUrl( 'https://wordpress.com/support' ) }
							icon={ false }
							target="_blank"
						>
							{ translate( 'Contact support' ) }
						</ExternalLink>
					</div>
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
	const canHandleHoldsAutomatically = holds.every( ( h ) => resolvableHolds.includes( h ) );

	// If it's not eligible for Atomic transfer lets also make sure it's not already Atomic with a plan below business.
	return (
		! canHandleHoldsAutomatically && ! isEligible && ! isAtomicSiteWithoutBusinessPlan( holds )
	);
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

/**
 * processMarketplaceExceptions: Remove 'NO_BUSINESS_PLAN' holds if the
 * INSTALL_PURCHASED_PLUGINS feature is present.
 *
 * Starter plans do not have the ATOMIC feature, but they have the
 * INSTALL_PURCHASED_PLUGINS feature which allows them to buy marketplace
 * addons (which do have the ATOMIC feature).
 *
 * This means a starter plan about to purchase a marketplace addon might get a
 * 'NO_BUSINESS_PLAN' hold on atomic transfer; however, if we're about to buy a
 * marketplace addon which provides the ATOMIC feature, then we can ignore this
 * hold.
 */
const processMarketplaceExceptions = (
	state: Record< string, unknown >,
	eligibilityData: EligibilityData,
	isEligible: boolean
) => {
	// If no eligibilityHolds are defined, skip.
	if ( typeof eligibilityData.eligibilityHolds === 'undefined' ) {
		return { eligibilityData, isEligible };
	}

	// If missing INSTALL_PURCHASED_PLUGINS feature, skip.
	const siteId = getSelectedSiteId( state );
	if ( ! siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ) ) {
		return { eligibilityData, isEligible };
	}

	// Remove "NO_BUSINESS_PLAN" holds, because we are about to purchase a
	// marketplace addon which will provide us the atomic feature.
	eligibilityData.eligibilityHolds = eligibilityData.eligibilityHolds.filter(
		( hold ) => hold !== 'NO_BUSINESS_PLAN'
	);
	isEligible = eligibilityData.eligibilityHolds.length > 0;
	return { eligibilityData, isEligible };
};

const mapStateToProps = ( state: Record< string, unknown >, ownProps: ExternalProps ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	let eligibilityData = ownProps.eligibilityData || getEligibility( state, siteId );
	let isEligible = ownProps.isEligible || isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = ownProps.eligibilityData || !! eligibilityData.lastUpdate;

	if ( ownProps.isMarketplace ) {
		( { eligibilityData, isEligible } = processMarketplaceExceptions(
			state,
			eligibilityData,
			isEligible
		) );
	}

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		siteId,
		siteSlug,
		siteIsLaunching: getRequest( state, launchSite( siteId ) )?.isLoading ?? false,
		siteIsSavingSettings: isSavingSiteSettings( state, siteId ?? 0 ),
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
	if ( ownProps.currentContext === 'plugin-details' ) {
		context = ownProps.currentContext;
		feature = ownProps.isMarketplace
			? WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
			: FEATURE_INSTALL_PLUGINS;
		ctaName = 'calypso-plugin-details-eligibility-upgrade-nudge';
	} else if ( includes( ownProps.backUrl, 'plugins' ) ) {
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
