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
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const Feature = ( { children } ) =>
	<li className="guided-transfer-card__feature-list-item">
		<Gridicon className="guided-transfer-card__feature-icon" size={ 18 } icon="checkmark" />
		<span className="guided-transfer-card__feature-text">
			{ children }
		</span>
	</li>;

class GuidedTransferCard extends Component {
	render() {
		const { translate } = this.props;

		return <div>
			<CompactCard>
				<div className="guided-transfer-card__options">
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
							isPrimary={ true }>
							{ translate( 'Purchase a Guided Transfer' ) }
						</Button>
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
} );

export default connect( mapStateToProps )( localize( GuidedTransferCard ) );
