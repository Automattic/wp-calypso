/**
 * External Dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import { useTranslate } from 'i18n-calypso';
import {
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackAntiSpamSlug,
	isJetpackPlanSlug,
	planHasFeature,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	JETPACK_SEARCH_PRODUCTS,
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
} from '@automattic/calypso-products';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import JetpackBenefitsSiteVisits from 'calypso/blocks/jetpack-benefits/site-visits';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';
import JetpackBenefitsSiteBackups from 'calypso/blocks/jetpack-benefits/site-backups';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';

/**
 * Style dependencies
 */
import './style.scss';

export const productHasBackups = ( productSlug: string ) => {
	return (
		// standalone backup product
		isJetpackBackupSlug( productSlug ) ||
		// check plans for Jetpack backup features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_DAILY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_DAILY_MONTHLY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_REALTIME ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY ) ) )
	);
};

export const productHasScan = ( productSlug: string ) => {
	return (
		// standalone scan product
		isJetpackScanSlug( productSlug ) ||
		// check plans for Jetpack scan features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_SCAN_DAILY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ) ) )
	);
};

export const productHasSearch = ( productSlug: string ) => {
	return (
		// standalone search product
		// there is not currently a isJetpackSearchSlug
		JETPACK_SEARCH_PRODUCTS.includes( productSlug ) ||
		// check plans for Jetpack search features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_SEARCH ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_SEARCH_MONTHLY ) ||
				// This is a bit obscure - checks specifically for Jetpack Business (Professional)
				// Is it an error that the plan spec in plans-list.js does not contain search features?
				planHasFeature( productSlug, FEATURE_ALL_PREMIUM_FEATURES_JETPACK ) ) )
	);
};

export const productHasAntiSpam = ( productSlug: string ) => {
	// check that this product is standalone anti-spam or one of the plans that contains it
	return (
		// standalone anti-spam product
		isJetpackAntiSpamSlug( productSlug ) ||
		// check plans for anti-spam features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_ANTI_SPAM ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_ANTI_SPAM_MONTHLY ) ) )
	);
};

export const productHasActivityLog = ( productSlug: string ) => {
	return isJetpackPlanSlug( productSlug ) || isJetpackBackupSlug( productSlug );
};

interface Props {
	siteId: number;
	productSlug: string;
}

// named export for cleaner testing of class methods
const JetpackBenefits: React.FC< Props > = ( { siteId, productSlug } ) => {
	const rewindState = useSelector( ( state ) => {
		return getRewindState( state, siteId );
	} );

	const scanState = useSelector( ( state ) => {
		return getSiteScanState( state, siteId );
	} );
	const translate = useTranslate();

	const siteHasBackups = () => {
		return 'unavailable' !== rewindState?.state;
	};

	const siteHasScan = () => {
		return 'unavailable' !== scanState?.state;
	};

	const renderSiteSearch = () => {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Search' ) }
				description={ translate(
					'Jetpack Search helps your visitors instantly find the right content – right when they need it.'
				) }
			/>
		);
	};

	const renderSiteAntiSpam = () => {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Anti-spam' ) }
				description={ translate(
					'Jetpack anti-spam automatically clears spam from comments and forms.'
				) }
			/>
		);
	};

	const renderSiteActivity = () => {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Activity Log' ) }
				description={ translate(
					'The Activity Log shows a list of management events that have occurred on your site.'
				) }
			/>
		);
	};

	return (
		<React.Fragment>
			{
				isJetpackPlanSlug( productSlug ) && <JetpackBenefitsSiteVisits siteId={ siteId } /> // makes the most sense to show visits/ stats for plans
			}
			{ siteHasBackups() && productHasBackups( productSlug ) && (
				<JetpackBenefitsSiteBackups
					siteId={ siteId }
					isStandalone={ isJetpackBackupSlug( productSlug ) }
				/>
			) }
			{ productHasSearch( productSlug ) && renderSiteSearch() }
			{ productHasAntiSpam( productSlug ) && renderSiteAntiSpam() }
			{ siteHasScan() && productHasScan( productSlug ) && (
				<JetpackBenefitsScanHistory
					siteId={ siteId }
					isStandalone={ isJetpackScanSlug( productSlug ) }
				/>
			) }
			{
				/*
				 * could look to expand output by using requestActivityLogs to get this information,
				 * there is also an endpoint for /activity/counts that has no matching state components that could get set up
				 */
				productHasActivityLog( productSlug ) && renderSiteActivity()
			}
		</React.Fragment>
	);
};

export default JetpackBenefits;
