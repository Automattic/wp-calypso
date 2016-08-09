/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const Feature = ( { children } ) =>
	<li className="exporter__guided-transfer-feature-list-item">
		<Gridicon className="exporter__guided-transfer-feature-icon" size={ 18 } icon="checkmark" />
		<span className="exporter__guided-transfer-feature-text">
			{ children }
		</span>
	</li>;

class GuidedTransferCard extends Component {
	constructor() {
		super();
		this.purchaseGuidedTransfer = this.purchaseGuidedTransfer.bind( this );
	}

	purchaseGuidedTransfer() {
		page( `/settings/export/guided/${this.props.siteSlug}` );
	}

	render() {
		const { translate } = this.props;

		return <div>
			<CompactCard>
				<div className="exporter__guided-transfer-options">
					<div className="exporter__guided-transfer-options-header-title-container">
						<h1 className="exporter__guided-transfer-title">
							{ translate( 'Guided Transfer' ) }
						</h1>
						<h2 className="exporter__guided-transfer-subtitle">
							<span className="exporter__guided-transfer-price">$129</span> One-time expense
						</h2>
					</div>
					<div className="exporter__guided-transfer-options-header-button-container">
						<Button
							onClick={ this.purchaseGuidedTransfer }
							isPrimary={ true }>
							{ translate( 'Purchase a Guided Transfer' ) }
						</Button>
					</div>
				</div>
			</CompactCard>
			<CompactCard className="exporter__guided-transfer-details">
				<div className="exporter__guided-transfer-details-container">
					<div className="exporter__guided-transfer-details-text">
						<h1 className="exporter__guided-transfer-details-title">
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
					<ul className="exporter__guided-transfer-feature-list">
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
} );

export default connect( mapStateToProps )( localize( GuidedTransferCard ) );

