/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import ExternalLinkWithTracking from 'components/external-link/with-tracking';
import FormattedHeader from 'components/formatted-header';
import { getSiteSlug } from 'state/sites/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackBackup } from 'lib/products-values';
import { JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL } from 'lib/products-values/constants';
import QuerySitePurchases from 'components/data/query-site-purchases';

class PlansFeaturesMainProductsHeader extends Component {
	static propTypes = {
		// Connected props
		isFetching: PropTypes.bool,
		purchases: PropTypes.array,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	siteHasJetpackBackup() {
		const { purchases } = this.props;

		if ( isEmpty( purchases ) ) {
			return false;
		}

		// Search through purchased products for Jetpack Backup.
		return some( purchases, purchase => purchase.active && isJetpackBackup( purchase ) );
	}

	getSubHeader() {
		const { isFetching, siteSlug, translate } = this.props;
		const baseCopy = translate( "Just looking for backups? We've got you covered." );

		// Don't render a link if a user already has a Jetpack Backup product or a plan with a backup feature.
		if ( isFetching || this.siteHasJetpackBackup() ) {
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
		const { siteId, translate } = this.props;

		return (
			<Fragment>
				<QuerySitePurchases siteId={ siteId } />
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

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isFetching: isFetchingSitePurchases( state ),
		purchases: getSitePurchases( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( PlansFeaturesMainProductsHeader ) );
