/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import ClipboardButtonInput from 'components/clipboard-button-input';
import PurchaseDetails from 'components/purchase-detail';
import PurchaseButton from 'components/purchase-detail/purchase-button';
import TipInfo from 'components/purchase-detail/tip-info';
import Dialog from 'components/dialog';
import googleTermsAndConditions from './google-voucher-TC';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import {
	getVouchersBySite,
	getGoogleAdCredits
} from 'state/sites/vouchers/selectors';
import wpcom from 'lib/wp';

class GoogleVoucherDetails extends Component {
	constructor() {
		super();

		this.state = {
			showTermsAndConditions: false,
			step: 0
		};
	}

	componentWillMount() {
		// bounds
		this.onButtonClick = this.onButtonClick.bind( this );
		this.onDialogCancel = this.onDialogCancel.bind( this );
		this.onAgreeButton = this.onAgreeButton.bind( this );

		const voucher = this.getVoucher();
		if ( voucher && voucher.status === 'assigned' ) {
			this.setState( { step: 2 } );
		}
	}

	onButtonClick() {
		this.incrementStep();
	}

	onDialogCancel() {
		this.setState( {
			showTermsAndConditions: false,
			step: 0
		} );
	}

	onAgreeButton() {
		wpcom
		.site( this.props.selectedSite.ID )
		.adCreditVouchers( 'google-ad-credits' )
		.assign();
	}

	incrementStep() {
		this.setState( {
			step: this.state.step + 1,
			showTermsAndConditions: ( this.state.step + 1 ) === 1
		} );
	}

	getVoucher() {
		const { googleAdCredits } = this.props;
		return googleAdCredits.length > 0 ? googleAdCredits[0] : {};
	}

	renderInitialStep() {
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

	renderTermsAndConditions() {
		return (
			<Dialog
				isVisible={ this.state.showTermsAndConditions }
				onClose={ this.onDialogCancel }
				additionalClassNames="google-voucher-dialog"
			>
				<div className="google-voucher-dialog__header">
					<img
						src="/calypso/images/google-adwords/google-adwords-voucher.svg"
						className="google-voucher-dialog__header__image" />

					<div className="google-voucher-dialog__header__text">
						<h1>{ i18n.translate( 'Terms of Service' ) }</h1>
						<p>{ i18n.translate( 'Google AdWords credit' ) }</p>
					</div>
				</div>

				<div className="google-voucher-dialog__body">
					{ googleTermsAndConditions() }
				</div>

				<div className="google-voucher-dialog__footer">
					<PurchaseButton
						className="google-vucher-dialog__cancel-button"
						primary={ false }
						onClick={ this.onDialogCancel }
						text={ i18n.translate( 'Cancel' ) } />

					<PurchaseButton
						onClick={ this.onAgreeButton }
						text={ i18n.translate( 'Agree' ) } />
				</div>
			</Dialog>
		);
	}

	renderCodeRedeemed() {
		const { code } = this.getVoucher();
		return (
			<div className="purchase-detail__body">
				<ClipboardButtonInput value={ code } />

				<div className="purchase-detail__google-voucher-code">
					<p className="form-setting-explanation"
						style={ { flex: '1', marginRight: 16, marginTop: 0 } }
					>
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
		const { selectedSite } = this.props;
		const { step } = this.state;
		let body;

		switch ( step ) {
			case 0:
				body = this.renderInitialStep();
				break;
			case 1:
				body = this.renderTermsAndConditions();
				break;
			case 2:
				body = this.renderCodeRedeemed();
				break;
		}

		return (
			<div>
				<QuerySiteVouchers siteId={ selectedSite.ID } />
				<PurchaseDetails
					id="google-ad-credits"
					icon="tag"
					title={ i18n.translate( 'Google AdWords credit' ) }
					description={ i18n.translate( 'Use your {{strong}}$100{{/strong}} in credit with Google to bring the right traffic to your most important Posts and Pages.', {
						components: {
							strong: <strong />
						}
					} ) }
					body={ body } />
			</div>
		);
	}
}

GoogleVoucherDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object
	] ).isRequired,
	googleAdCredits: PropTypes.array,
	step: PropTypes.number.isRequired
};

GoogleVoucherDetails.defaultProps = {
	step: 0
};

export default connect(
	( state, props ) => {
		const site = props.selectedSite;
		return {
			vouchers: getVouchersBySite( state, site ),
			googleAdCredits: getGoogleAdCredits( state, site )
		};
	}
)( GoogleVoucherDetails );
