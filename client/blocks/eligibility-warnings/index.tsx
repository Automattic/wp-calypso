import {
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_PERFORMANCE,
	FEATURE_UPLOAD_THEMES,
	FEATURE_SFTP,
	FEATURE_INSTALL_PLUGINS,
	PLAN_BUSINESS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { CompactCard, Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize, LocalizeProps } from 'i18n-calypso';
import { includes } from 'lodash';
import { useState } from 'react';
import { connect } from 'react-redux';
import DataCenterPicker from 'calypso/blocks/data-center-picker';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
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
import HoldList, { hasBlockingHold, HardBlockingNotice, getBlockingMessages } from './hold-list';
import SupportLink from './support-link';
import { isAtomicSiteWithoutBusinessPlan } from './utils';
import WarningList from './warning-list';
import type { EligibilityData } from 'calypso/state/automated-transfer/selectors';
import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface ExternalProps {
	siteId?: number | null;
	isEligible?: boolean;
	backUrl?: string;
	onDismiss?: () => void;
	onProceed: ( options: { geo_affinity?: string } ) => void;
	standaloneProceed: boolean;
	className?: string;
	eligibilityData?: EligibilityData;
	currentContext?: string;
	isMarketplace?: boolean;
	isOnboarding?: boolean;
	showDataCenterPicker?: boolean;
	disableContinueButton?: boolean;
	showFreeTrial?: boolean;
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
	onDismiss,
	onProceed,
	standaloneProceed,
	recordUpgradeClick,
	showDataCenterPicker,
	siteId,
	siteSlug,
	siteIsLaunching,
	siteIsSavingSettings,
	trackDataCenterPickerShowClick,
	trackDataCenterPickerHideClick,
	trackDataCenterPickerSelect,
	launchSite: launch,
	makeSitePublic,
	translate,
	disableContinueButton,
	showFreeTrial,
}: Props ) => {
	const warnings = eligibilityData.eligibilityWarnings || [];
	const listHolds = eligibilityData.eligibilityHolds || [];

	const [ selectedGeoAffinity, setSelectedGeoAffinity ] = useState( '' );

	const showWarnings = warnings.length > 0 && ! hasBlockingHold( listHolds );
	const classes = clsx(
		'eligibility-warnings',
		{
			'eligibility-warnings__placeholder': isPlaceholder,
			'eligibility-warnings--with-indent': showWarnings,
			'eligibility-warnings--blocking-hold': hasBlockingHold( listHolds ),
			'eligibility-warnings--without-title':
				context !== 'plugin-details' && context !== 'hosting-features',
		},
		className
	);

	const launchCurrentSite = () => launch( siteId );
	const makeCurrentSitePublic = () => makeSitePublic( siteId );

	const logEventAndProceed = () => {
		const options = {
			geo_affinity: selectedGeoAffinity,
		};
		if ( standaloneProceed ) {
			onProceed( options );
			return;
		}
		if ( siteRequiresUpgrade( listHolds ) ) {
			recordUpgradeClick( ctaName, feature );
			const planSlug = PLAN_BUSINESS;
			let redirectUrl = `/checkout/${ siteSlug }/${ planSlug }`;
			if ( context === 'plugins-upload' ) {
				redirectUrl = `${ redirectUrl }?redirect_to=${ encodeURIComponent(
					`/plugins/upload/${ siteSlug }?showUpgradeSuccessNotice=true`
				) }`;
			}
			if ( showFreeTrial ) {
				onProceed( options );
				return;
			}
			page.redirect( redirectUrl );
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
		onProceed( options );
	};

	const showThisSiteIsEligibleMessage =
		isEligible && 0 === listHolds.length && 0 === warnings.length;

	const blockingMessages = getBlockingMessages( translate );

	let filteredHolds = listHolds;
	if ( context === 'plugin-details' ) {
		filteredHolds = listHolds.filter( ( hold ) => hold !== 'NO_BUSINESS_PLAN' );
	}

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>
			{ ! isPlaceholder && context === 'plugin-details' && hasBlockingHold( listHolds ) && (
				<CompactCard>
					<HardBlockingNotice
						holds={ listHolds }
						translate={ translate }
						blockingMessages={ blockingMessages }
					/>
				</CompactCard>
			) }

			{ ( isPlaceholder || filteredHolds.length > 0 ) && ! showFreeTrial && (
				<CompactCard>
					<HoldList
						context={ context }
						holds={ filteredHolds }
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

			{ showDataCenterPicker && isEligible && ! hasBlockingHold( listHolds ) && (
				<CompactCard className="eligibility-warnings__data-center-picker">
					<TrackComponentView eventName="calypso_automated_transfer_datacenter_picker_display" />
					<DataCenterPicker
						value={ selectedGeoAffinity }
						onChange={ ( value ) => {
							trackDataCenterPickerSelect( { geo_affinity: value } );
							setSelectedGeoAffinity( value );
						} }
						onClickShowPicker={ trackDataCenterPickerShowClick }
						onClickHidePicker={ trackDataCenterPickerHideClick }
					/>
				</CompactCard>
			) }

			<CompactCard>
				<div className="eligibility-warnings__confirm-buttons">
					<SupportLink
						shouldUseHelpAssistant={ context === 'plugin-details' }
						onShowHelpAssistant={ onDismiss }
					/>
					<Button
						variant="primary"
						__next40pxDefaultSize
						disabled={
							isProceedButtonDisabled( isEligible, listHolds ) ||
							siteIsSavingSettings ||
							siteIsLaunching ||
							disableContinueButton
						}
						isBusy={ siteIsLaunching || siteIsSavingSettings || disableContinueButton }
						onClick={ logEventAndProceed }
					>
						{ getProceedButtonText( listHolds, translate, context, showFreeTrial ) }
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

function getProceedButtonText(
	holds: string[],
	translate: LocalizeProps[ 'translate' ],
	context: string | null,
	showFreeTrial?: boolean
) {
	if ( siteRequiresUpgrade( holds ) ) {
		if ( context === 'plugin-details' || context === 'plugins' ) {
			return translate( 'Upgrade and activate plugin' );
		}
		if ( showFreeTrial ) {
			return translate( 'Start your free trial' );
		}
		return translate( 'Upgrade and continue' );
	}
	if ( siteRequiresLaunch( holds ) ) {
		return translate( 'Launch your site and continue' );
	}
	if ( siteRequiresGoingPublic( holds ) ) {
		return translate( 'Make your site public and continue' );
	}
	if ( context === 'hosting-features' ) {
		return translate( 'Activate hosting features' );
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
 * INSTALL_PURCHASED_PLUGINS feature is present or is onboarding flow.
 *
 * Starter plans do not have the ATOMIC feature, but they have the
 * INSTALL_PURCHASED_PLUGINS feature which allows them to buy marketplace
 * addons (which do have the ATOMIC feature).
 *
 * This means a starter plan about to purchase a marketplace addon might get a
 * 'NO_BUSINESS_PLAN' hold on atomic transfer; however, if we're about to buy a
 * marketplace addon which provides the ATOMIC feature, then we can ignore this
 * hold.
 *
 * The Onboarding flow takes care of upgrading the Business plan so we can
 * can ignore the 'NO_BUSINESS_PLAN' hold.
 */
const processMarketplaceExceptions = (
	state: Record< string, unknown >,
	eligibilityData: EligibilityData,
	isEligible: boolean,
	isOnboarding?: boolean
) => {
	// If no eligibilityHolds are defined, skip.
	if ( typeof eligibilityData.eligibilityHolds === 'undefined' ) {
		return { eligibilityData, isEligible };
	}

	// If is not Onboarding flow and missing INSTALL_PURCHASED_PLUGINS feature, skip.
	const siteId = getSelectedSiteId( state );
	if (
		! isOnboarding &&
		! siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	) {
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
	const siteId = getSelectedSiteId( state ) || ownProps.siteId || null;
	const siteSlug = getSelectedSiteSlug( state );
	let eligibilityData = ownProps.eligibilityData || getEligibility( state, siteId );
	let isEligible = ownProps.isEligible || isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = ownProps.eligibilityData || !! eligibilityData.lastUpdate;

	if ( ownProps.isMarketplace ) {
		( { eligibilityData, isEligible } = processMarketplaceExceptions(
			state,
			eligibilityData,
			isEligible,
			ownProps.isOnboarding
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
	trackDataCenterPickerShowClick: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_datacenter_picker_show_click', eventProperties ),
	trackDataCenterPickerHideClick: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_datacenter_picker_hide_click', eventProperties ),
	trackDataCenterPickerSelect: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_datacenter_picker_select', eventProperties ),
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
	} else if ( ownProps.currentContext === 'hosting-features' ) {
		context = ownProps.currentContext;
		feature = FEATURE_SFTP;
		ctaName = 'calypso-hosting-features-eligibility-upgrade-nudge';
	} else if ( includes( ownProps.backUrl, 'plugins' ) ) {
		context = 'plugins-upload';
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

	const onProceed = ( options: { geo_affinity?: string } ) => {
		ownProps.onProceed( options );
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
