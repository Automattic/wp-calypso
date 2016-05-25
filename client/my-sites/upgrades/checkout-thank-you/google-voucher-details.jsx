/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import ClipboardButtonInput from 'components/clipboard-button-input';
import PurchaseDetails from 'components/purchase-detail';
import PurchaseButton from 'components/purchase-detail/purchase-button';
import TipInfo from 'components/purchase-detail/tip-info';

class GoogleVoucherDetails extends Component {
	constructor() {
		super();

		this.state = { step: 0 };
	}

	componentWillMount() {
		this.onButtonClick = this.onButtonClick.bind( this );
	}

	onButtonClick() {
		this.incrementStep();
	}

	incrementStep() {
		this.setState( { step: this.state.step + 1 } );
	}

	renderStepZero() {
		return (
			<div className="purchase-detail__body">
				<PurchaseButton
					onClick={ this.onButtonClick }
					text={ i18n.translate( 'Generate Code' ) } />

				<TipInfo
					info={ i18n.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
			</div>
		);
	}

	renderStepOne() {
		return (
			<div className="purchase-detail__body">
				<ClipboardButtonInput value="3JFE4-RVDDD-PV3P" />

				<div style={ { display: 'flex', alignItems: 'flex-start', marginTop: 12 } }>
					<p
						className="form-setting-explanation"
						style={ { flex: '1', marginRight: 16, marginTop: 0 } }>
						{
							i18n.translate( 'Copy this unique, one-time use code to your clipboard and setup your Google AdWords account. {{a}}View help guide{{/a}}',
								{
									components: { a: <a href="#" target="_blank" style={ { color: '#00AADD', textDecoration: 'underline' } } /> }
								}
							)
						}
					</p>

					<PurchaseButton
						onClick={ this.onButtonClick }
						text={ i18n.translate( 'Setup Google AdWords' ) } />

				</div>

				<TipInfo
					className="purchase-detail__google-voucher-advice"
					info={ i18n.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
			</div>
		);
	}

	render() {
		const { step } = this.state;
		let body;

		switch ( step ) {
			case 0:
				body = this.renderStepZero();
				break;
			case 1:
				body = this.renderStepOne();
				break;
		}

		return (
			<PurchaseDetails
				id="google-ad-credit"
				icon="tag"
				title={ i18n.translate( 'Google AdWords credit' ) }
				description={ i18n.translate( 'Use your {{strong}}$100{{/strong}} in credit with Google to bring the right traffic to your most important Posts and Pages.', {
					components: {
						strong: <strong />
					}
				} ) }
				body={ body } />
		);
	}
}

GoogleVoucherDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] ).isRequired,
	step: PropTypes.number.isRequired
};

GoogleVoucherDetails.defaultProps = {
	step: 0
};

export default GoogleVoucherDetails;
