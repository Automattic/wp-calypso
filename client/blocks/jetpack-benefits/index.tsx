import {
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isCompletePlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import {
	productHasSearch,
	productHasBackups,
	productHasScan,
	productHasAntiSpam,
	productHasVideoPress,
	productHasBoost,
} from 'calypso/blocks/jetpack-benefits/feature-checks';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';
import JetpackBenefitsSiteBackups from 'calypso/blocks/jetpack-benefits/site-backups';
import JetpackBenefitsVideoPress from 'calypso/blocks/jetpack-benefits/videopress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';

import './style.scss';

interface Props {
	siteId: number;
	productSlug: string;
}

const JetpackBenefits: React.FC< Props > = ( { siteId, productSlug } ) => {
	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) );
	const scanState = useSelector( ( state ) => getSiteScanState( state, siteId ) );
	const translate = useTranslate();

	const siteHasBackups = () => {
		return 'unavailable' !== rewindState?.state;
	};

	const siteHasScan = () => {
		return 'unavailable' !== scanState?.state;
	};

	return (
		<React.Fragment>
			{ siteHasBackups() && productHasBackups( productSlug ) && (
				<JetpackBenefitsSiteBackups
					siteId={ siteId }
					isStandalone={ isJetpackBackupSlug( productSlug ) }
				/>
			) }
			{ productHasSearch( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Search' ) }
					description={ translate(
						'Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
				/>
			) }
			{ productHasBoost( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Boost' ) }
					description={ translate(
						'Jetpack Boost improves your site performance and automatically generates critical CSS.'
					) }
				/>
			) }
			{ productHasAntiSpam( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Akismet Anti-spam' ) }
					description={ translate(
						'Jetpack Akismet Anti-spam automatcally clears spam from comments and forms.'
					) }
				/>
			) }
			{ siteHasScan() && productHasScan( productSlug ) && (
				<JetpackBenefitsScanHistory
					siteId={ siteId }
					isStandalone={ isJetpackScanSlug( productSlug ) }
				/>
			) }
			{ ( isCompletePlan( productSlug ) || isSecurityRealTimePlan( productSlug ) ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Activity Log' ) }
					description={ translate(
						'Your 1-year Activity Log archive will revert to the 20 most recent events.'
					) }
				/>
			) }
			{ isSecurityDailyPlan( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Activity Log' ) }
					description={ translate(
						'Your 30-day Activity Log archive will revert to the 20 most recent events.'
					) }
				/>
			) }
			{ productHasVideoPress( productSlug ) && <JetpackBenefitsVideoPress siteId={ siteId } /> }
		</React.Fragment>
	);
};

export default JetpackBenefits;
