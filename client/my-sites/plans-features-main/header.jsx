/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLinkWithTracking from 'components/external-link/with-tracking';
import FormattedHeader from 'components/formatted-header';
import { getSitePlanSlug, getSiteSlug } from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { planHasFeature } from 'lib/plans';
import { isJetpackBackup } from 'lib/products-values';
import {
	JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL,
	JETPACK_BACKUP_PRODUCTS,
} from 'lib/products-values/constants';
import { addQueryArgs } from 'lib/route';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';

class PlansFeaturesMainHeader extends Component {
	siteHasJetpackBackup() {
		const { purchases } = this.props;

		if ( isEmpty( purchases ) ) {
			return false;
		}

		// Search through purchased products for Jetpack Backup.
		return ! isEmpty(
			purchases.find( purchase => purchase.active && isJetpackBackup( purchase ) )
		);
	}

	planHasJetpackBackup() {
		const { sitePlanSlug } = this.props;

		if ( ! sitePlanSlug ) {
			return false;
		}

		// Check if the current site plan has a backup feature.
		return ! isEmpty(
			JETPACK_BACKUP_PRODUCTS.find( productSlug => planHasFeature( sitePlanSlug, productSlug ) )
		);
	}

	getSubHeader() {
		const { siteSlug, translate } = this.props;
		const baseCopy = translate( "Just looking for a backups? We've got you covered." );

		// Don't render a link if a user already has a Jetpack Backup product or a plan with a backup feature.
		if ( this.siteHasJetpackBackup() || this.planHasJetpackBackup() ) {
			return baseCopy;
		}

		// If we have a site in this context, add it to the landing page URL.
		const linkUrl = siteSlug
			? addQueryArgs( { site: siteSlug }, JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL )
			: JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL;

		return (
			<Fragment>
				{ baseCopy }
				<br />
				<ExternalLinkWithTracking
					href={ linkUrl }
					tracksEventName="calypso_plan_link_click"
					tracksEventProps={ {
						link_location: 'product_jetpack_backup_description',
						link_slug: 'which-one-do-i-need',
					} }
					icon
				>
					{ translate( 'Which backup option is best for me?' ) }
				</ExternalLinkWithTracking>
			</Fragment>
		);
	}

	render() {
		const { selectedSiteId, translate } = this.props;

		return (
			<Fragment>
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				<FormattedHeader
					headerText={ translate( 'Solutions' ) }
					subHeaderText={ this.getSubHeader() }
					compactOnMobile
					isSecondary
				/>
			</Fragment>
		);
	}
}

PlansFeaturesMainHeader.propTypes = {
	purchases: PropTypes.array,
	siteId: PropTypes.number,
	sitePlanSlug: PropTypes.string,
	siteSlug: PropTypes.string,
};

export default connect( ( state, { siteId } ) => {
	const selectedSiteId = siteId || getSelectedSiteId( state );

	return {
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSiteId,
		sitePlanSlug: getSitePlanSlug( state, selectedSiteId ),
		siteSlug: getSiteSlug( state, selectedSiteId ),
	};
} )( localize( PlansFeaturesMainHeader ) );
