/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';

/**
 * Internal dependencies
 */
import localize from 'lib/mixins/i18n/localize';
import ClipboardButtonInput from 'components/clipboard-button-input';
import PurchaseDetails from 'components/purchase-detail';
import PurchaseButton from 'components/purchase-detail/purchase-button';
import TipInfo from 'components/purchase-detail/tip-info';
import Dialog from 'components/dialog';
import googleTermsAndConditions from './google-voucher-TC';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import {
	assignSiteVoucher as assignVoucher
} from 'state/sites/vouchers/actions';
import { GOOGLE_CREDITS } from 'state/sites/vouchers/service-types';
import {
	getVouchersBySite,
	getGoogleAdCredits
} from 'state/sites/vouchers/selectors';

class GoogleVoucherDetails extends Component {
	constructor() {
		super();

		// bounds
		this.onButtonClick = this.onButtonClick.bind( this );
		this.onDialogCancel = this.onDialogCancel.bind( this );
		this.onAgreeButton = this.onAgreeButton.bind( this );

		// debounced
		this.incrementStep = debounce( this.incrementStep, 300 );

		this.state = {
			showTermsAndConditions: false,
			step: 0
		};
	}

	componentWillMount() {
		const voucher = this.getVoucher();
		if ( voucher && voucher.status === 'assigned' ) {
			this.setState( { step: 2 } );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.googleAdCredits ) {
			return null;
		}

		if ( this.props.googleAdCredits === nextProps.googleAdCredits ) {
			return null;
		}

		if ( nextProps.googleAdCredits.length > 0 ) {
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
		this.props.assignVoucher( this.props.selectedSite.ID, GOOGLE_CREDITS );

		this.setState( {
			showTermsAndConditions: false,
			step: 2
		} );
	}

	incrementStep() {
		this.setState( {
			step: this.state.step + 1,
			showTermsAndConditions: ( this.state.step + 1 ) === 1
		} );
	}

	getVoucher( props = this.props ) {
		const { googleAdCredits } = props;
		return googleAdCredits.length > 0 ? googleAdCredits[0] : {};
	}

	renderInitialStep() {
		return (
			<div className="purchase-detail__body">
				<PurchaseButton
					onClick={ this.onButtonClick }
					text={ this.props.translate( 'Generate Code' ) } />

				<TipInfo
					info={ this.props.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
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
						src="/calypso/images/google-vouchers/google-voucher.svg"
						className="google-voucher-dialog__header__image" />

					<div className="google-voucher-dialog__header__text">
						<h1>{ this.props.translate( 'Terms of Service' ) }</h1>
						<p>{ this.props.translate( 'Google AdWords credit' ) }</p>
					</div>
				</div>

				<div className="google-voucher-dialog__body">
					{ googleTermsAndConditions() }
				</div>

				<div className="google-voucher-dialog__footer">
					<PurchaseButton
						className="google-vouchers-dialog__cancel-button"
						primary={ false }
						onClick={ this.onDialogCancel }
						text={ this.props.translate( 'Cancel' ) } />

					<PurchaseButton
						className="google-vouchers-dialog__agree-button"
						onClick={ this.onAgreeButton }
						text={ this.props.translate( 'Agree' ) } />
				</div>
			</Dialog>
		);
	}

	renderCodeRedeemed() {
		const { code } = this.getVoucher();
		return (
			<div className="purchase-detail__body">
				<ClipboardButtonInput
					value={ code }
					disabled= { ! code } />

				<div className="purchase-detail__google-voucher-code">
					<p className="form-setting-explanation">
						{
							this.props.translate( 'Copy this unique, one-time use code to your clipboard and setup your Google AdWords account. {{a}}View help guide{{/a}}',
								{
									components: { a: <a className="purchase-detail__google-voucher-code__help-link" href="#" target="_blank" /> }
								}
							)
						}
					</p>

					<PurchaseButton
						href="https://www.google.com/adwords/"
						target="_blank"
						text={ this.props.translate( 'Setup Google AdWords' ) } />

				</div>

				<TipInfo
					className="purchase-detail__google-voucher-advice"
					info={ this.props.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
			</div>
		);
	}

	render() {
		const { selectedSite, translate } = this.props;
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
					id="google-credits"
					icon="tag"
					title={ translate( 'Google AdWords credit' ) }
					description={ translate( 'Use your {{strong}}$100{{/strong}} in credit with Google to bring the right traffic to your most important Posts and Pages.', {
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
	},
	{ assignVoucher }
)( localize( GoogleVoucherDetails ) );
