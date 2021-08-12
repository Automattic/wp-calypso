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
	isJetpackPlanSlug,
} from '@automattic/calypso-products';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import JetpackBenefitsSiteVisits from 'calypso/blocks/jetpack-benefits/site-visits';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';
import JetpackBenefitsSiteBackups from 'calypso/blocks/jetpack-benefits/site-backups';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import {
	productHasSearch,
	productHasBackups,
	productHasScan,
	productHasActivityLog,
	productHasAntiSpam,
} from 'calypso/blocks/jetpack-benefits/feature-checks';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	siteId: number;
	productSlug: string;
}

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
			{ productHasSearch( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Search' ) }
					description={ translate(
						'Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
				/>
			) }
			{ productHasAntiSpam( productSlug ) && (
				<JetpackBenefitsCard
					headline={ translate( 'Anti-spam' ) }
					description={ translate(
						'Jetpack anti-spam automatically clears spam from comments and forms.'
					) }
				/>
			) }
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
				productHasActivityLog( productSlug ) && (
					<JetpackBenefitsCard
						headline={ translate( 'Activity Log' ) }
						description={ translate(
							'The activity log shows a full list of management events that have occurred on your site.'
						) }
					/>
				)
			}
		</React.Fragment>
	);
};

export default JetpackBenefits;
