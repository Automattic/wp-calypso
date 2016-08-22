/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import QuerySiteGuidedTransfer from 'components/data/query-site-guided-transfer';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { isGuidedTransferAvailableForAllSites } from 'state/sites/guided-transfer/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Popover from 'components/popover';

const Feature = ( { children } ) =>
	<li className="guided-transfer-card__feature-list-item">
		<Gridicon className="guided-transfer-card__feature-icon" size={ 18 } icon="checkmark" />
		<span className="guided-transfer-card__feature-text">
			{ children }
		</span>
	</li>;

class GuidedTransferCard extends Component {
	constructor() {
		super();
		this.state = { isPopupVisible: false };
	}

	render() {
		const {
			translate,
			isAvailable,
			siteId,
		} = this.props;

		const setButtonRef = c => this._purchaseButton = c;
		const showPopup = () => this.setState( { isPopupVisible: true } );
		const hidePopup = () => this.setState( { isPopupVisible: false } );
		const { isPopupVisible } = this.state;

		return <div>
			<CompactCard>
				<QuerySiteGuidedTransfer siteId={ siteId } />
				<div className="guided-transfer-card__options"
					onMouseEnter={ showPopup }
					onMouseLeave={ hidePopup }
				>
					<div className="guided-transfer-card__options-header-title-container">
						<h1 className="guided-transfer-card__title">
							{ translate( 'Guided Transfer' ) }
						</h1>
						<h2 className="guided-transfer-card__subtitle">
							<span className="guided-transfer-card__price">$129</span>
							&nbsp;
							{ translate( 'One-time expense' ) }
						</h2>
					</div>
					<div className="guided-transfer-card__options-header-button-container">
						<Button
							href={ `/settings/export/guided/${this.props.siteSlug}` }
							isPrimary={ true }
							ref={ setButtonRef }
							disabled={ ! isAvailable }
						>
							{ isAvailable
								? translate( 'Purchase a Guided Transfer' )
								: translate( 'Guided Transfer unavailable' ) }
						</Button>

						{ ! isAvailable && isPopupVisible &&
							<Popover
								context={ this._purchaseButton }
								position="bottom"
								onClose={ hidePopup }
								isVisible={ isPopupVisible }
							>
								<p className="guided-transfer-card__unavailable-notice">
									{ translate( `Guided Transfer is unavailable at the moment. We'll
									be back as soon as possible! In the meantime, you can transfer your
									WordPress.com blog elsewhere by following {{a}}these steps{{/a}}`,
									{ components: {
										a: <a href="https://move.wordpress.com/" />
									} } ) }
								</p>
							</Popover>
						}
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
							'one of our hosting partners.', { components: { strong: <strong /> } }
						) }
						<br/>
						<a href="https://en.support.wordpress.com/guided-transfer/" >
							{ translate( 'Learn more.' ) }
						</a>
					</div>
					<ul className="guided-transfer-card__feature-list">
						<Feature>{ translate( 'Seamless content transfer' ) }</Feature>
						<Feature>{ translate( 'Install and configure plugins to keep your functionality' ) }</Feature>
						<Feature>
							{ translate( 'Switch your domain over {{link}}and more!{{/link}}', {
								components: {
									link: <a href="https://en.support.wordpress.com/guided-transfer/" />
								}
							} ) }
						</Feature>
					</ul>
				</div>
			</CompactCard>
		</div>;
	}
}

const mapStateToProps = state => ( {
	siteId: getSelectedSiteId( state ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
	isAvailable: isGuidedTransferAvailableForAllSites( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps )( localize( GuidedTransferCard ) );
