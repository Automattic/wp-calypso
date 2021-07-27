/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import {
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isCompletePlan,
	isPremiumPlan,
	isSecurityDailyPlan,
	isSecurityRealTimePlan,
	isPersonalPlan,
	isBusinessPlan,
	isJetpackSearch,
	isJetpackAntiSpamSlug,
	isJetpackPlanSlug,
} from '@automattic/calypso-products';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import JetpackBenefitsSiteVisits from 'calypso/blocks/jetpack-benefits/site-visits';
import JetpackBenefitsScanHistory from 'calypso/blocks/jetpack-benefits/scan-history';
import JetpackBenefitsSiteBackups from 'calypso/blocks/jetpack-benefits/site-backups';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackBenefits extends React.Component {
	siteHasBackups() {
		return 'unavailable' !== this.props.rewindState?.state;
	}

	productHasBackups() {
		const { productSlug } = this.props;
		// check that this product is standalone backups or a plan that contains backups
		return (
			isJetpackBackupSlug( productSlug ) ||
			isPersonalPlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			( ! isPremiumPlan && isBusinessPlan( productSlug ) ) || // Jetpack Professional
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug ) ||
			isCompletePlan( productSlug )
		);
	}

	siteHasScan() {
		return 'unavailable' !== this.props.scanState?.state;
	}

	productHasScan() {
		const { productSlug } = this.props;
		// check that this product is standalone scan or a plan that contains it
		return (
			isJetpackScanSlug( productSlug ) ||
			isCompletePlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug )
		);
	}

	productHasSearch() {
		const { product, productSlug } = this.props;
		// check that this product is a standalone search product or a plan that contains it
		return (
			isJetpackSearch( product ) ||
			isCompletePlan( productSlug ) ||
			( ! isPremiumPlan && isBusinessPlan( productSlug ) ) // Jetpack Professional
		);
	}

	productHasAntiSpam() {
		const { productSlug } = this.props;
		// check that this product is standalone anti-spam or one of the plans that contains it
		return (
			isJetpackAntiSpamSlug( productSlug ) ||
			isPersonalPlan( productSlug ) ||
			isPremiumPlan( productSlug ) ||
			( ! isPremiumPlan && isBusinessPlan( productSlug ) ) || // Jetpack Professional
			isSecurityDailyPlan( productSlug ) ||
			isSecurityRealTimePlan( productSlug ) ||
			isCompletePlan( productSlug )
		);
	}

	productHasActivityLog() {
		const { productSlug } = this.props;

		return isJetpackPlanSlug( productSlug ) || isJetpackBackupSlug( productSlug );
	}

	renderSiteSearch() {
		return (
			<JetpackBenefitsCard
				headline="Search"
				description="You will lose access to Jetpack's improved site search"
			/>
		);
	}

	renderSiteAntiSpam() {
		return (
			<JetpackBenefitsCard
				headline="Anti-spam"
				description="You will no longer have spam comment protection/ filtering."
			/>
		);
	}

	renderSiteActivity() {
		return (
			<JetpackBenefitsCard
				headline="Activity Log"
				description="You will not be able to view your site's activity log any longer."
			/>
		);
	}

	render() {
		const { productSlug, siteId } = this.props;

		return (
			<React.Fragment>
				{
					isJetpackPlanSlug( productSlug ) && (
						<JetpackBenefitsSiteVisits siteId={ this.props.siteId } />
					) // only makes sense to show visits/ stats for plans
				}
				{ this.siteHasBackups() && this.productHasBackups() && (
					<JetpackBenefitsSiteBackups
						siteId={ siteId }
						isStandalone={ isJetpackBackupSlug( productSlug ) }
					/>
				) }
				{ this.productHasSearch() && this.renderSiteSearch() }
				{ this.productHasAntiSpam() && this.renderSiteAntiSpam() }
				{ this.siteHasScan() && this.productHasScan() && (
					<React.Fragment>
						<QueryJetpackScan siteId={ siteId } />
						<JetpackBenefitsScanHistory
							siteId={ siteId }
							isStandalone={ isJetpackScanSlug( productSlug ) }
						/>
					</React.Fragment>
				) }
				{
					/*
					 * could look to expand output by using requestActivityLogs to get this information,
					 * there is also an endpoint for /activity/counts that has no matching state components that could get set up
					 */
					this.productHasActivityLog() && this.renderSiteActivity()
				}
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId, productSlug } ) => {
	const product = getProductBySlug( state, productSlug );

	return {
		siteId: siteId,
		product: product,
		productSlug: productSlug,
		rewindState: getRewindState( state, siteId ),
		scanState: getSiteScanState( state, siteId ),
	};
}, {} )( localize( JetpackBenefits ) );
