/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import QuerySiteGuidedTransfer from 'components/data/query-site-guided-transfer';
import Button from 'components/forms/form-button';
import {
	isGuidedTransferAvailableForAllSites,
	isRequestingGuidedTransferStatus,
} from 'state/sites/guided-transfer/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getProductDisplayCost } from 'state/products-list/selectors';
import InfoPopover from 'components/info-popover';
import { GUIDED_TRANSFER } from 'lib/url/support';

/**
 * Style dependencies
 */
import './style.scss';

const Feature = ( { children } ) => (
	<li className="guided-transfer-card__feature-list-item">
		<Gridicon className="guided-transfer-card__feature-icon" size={ 18 } icon="checkmark" />
		<span className="guided-transfer-card__feature-text">{ children }</span>
	</li>
);

const UnavailableInfo = localize( ( { translate } ) => (
	<div className="guided-transfer-card__unavailable-notice">
		<span>{ translate( 'Guided Transfer unavailable' ) }</span>
		<InfoPopover className="guided-transfer-card__unavailable-info-icon" position="left">
			{ translate(
				"Guided Transfer is unavailable at the moment. We'll " +
					'be back as soon as possible! In the meantime, you can transfer your ' +
					'WordPress.com blog elsewhere by following {{a}}these steps{{/a}}',
				{
					components: {
						a: <a href="https://move.wordpress.com/" />,
					},
				}
			) }
		</InfoPopover>
	</div>
) );

class GuidedTransferCard extends Component {
	render() {
		const { translate, isAvailable, isRequestingStatus, siteId, siteSlug, cost } = this.props;

		return (
			<div>
				<CompactCard>
					<QuerySiteGuidedTransfer siteId={ siteId } />
					<div className="guided-transfer-card__options">
						<div className="guided-transfer-card__options-header-title-container">
							<h1 className="guided-transfer-card__title">{ translate( 'Guided Transfer' ) }</h1>
							<h2 className="guided-transfer-card__subtitle">
								{ translate( '{{cost/}} One-time expense', {
									components: {
										cost: <span className="guided-transfer-card__price">{ cost }</span>,
									},
								} ) }
							</h2>
						</div>
						<div className="guided-transfer-card__options-header-button-container">
							{ isAvailable || isRequestingStatus ? (
								<Button
									href={ `/export/guided/${ siteSlug }` }
									isPrimary={ false }
									disabled={ isRequestingStatus }
								>
									{ translate( 'Purchase a Guided Transfer' ) }
								</Button>
							) : (
								<UnavailableInfo />
							) }
						</div>
					</div>
				</CompactCard>
				<CompactCard className="guided-transfer-card__details">
					<div className="guided-transfer-card__details-container">
						<div className="guided-transfer-card__details-text">
							<h1 className="guided-transfer-card__details-title">
								{ translate( 'Hassle-free migration with two weeks of support' ) }
							</h1>
							{ translate(
								'Have one of our Happiness Engineers {{strong}}transfer your ' +
									'site{{/strong}} to a self-hosted WordPress.org installation with ' +
									'one of our hosting partners.',
								{ components: { strong: <strong /> } }
							) }
							<br />
							<a href={ GUIDED_TRANSFER }>{ translate( 'Learn more.' ) }</a>
						</div>
						<ul className="guided-transfer-card__feature-list">
							<Feature>{ translate( 'Seamless content transfer' ) }</Feature>
							<Feature>
								{ translate( 'Install and configure plugins to keep your functionality' ) }
							</Feature>
							<Feature>
								{ translate( 'Switch your domain over {{link}}and more!{{/link}}', {
									components: {
										link: <a href={ GUIDED_TRANSFER } />,
									},
								} ) }
							</Feature>
						</ul>
					</div>
				</CompactCard>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	cost: getProductDisplayCost( state, 'guided_transfer' ),
	siteId: getSelectedSiteId( state ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
	isRequestingStatus: isRequestingGuidedTransferStatus( state, getSelectedSiteId( state ) ),
	isAvailable: isGuidedTransferAvailableForAllSites( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( GuidedTransferCard ) );
