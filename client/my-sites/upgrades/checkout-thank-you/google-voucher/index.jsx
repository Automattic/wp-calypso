/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from 'components/clipboard-button-input';
import PurchaseDetails from 'components/purchase-detail';
import PurchaseButton from 'components/purchase-detail/purchase-button';
import TipInfo from 'components/purchase-detail/tip-info';
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';
import termsAndConditions from './terms-and-conditions';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import {
	assignSiteVoucher as assignVoucher
} from 'state/sites/vouchers/actions';
import { GOOGLE_CREDITS } from 'state/sites/vouchers/service-types';
import {
	getVouchersBySite,
	getGoogleAdCredits
} from 'state/sites/vouchers/selectors';

const [
	INITIAL_STEP,
	TERMS_AND_CONDITIONS,
	CODE_REDEEMED
] = [
	'INITIAL_STEP',
	'TERMS_AND_CONDITIONS',
	'CODE_REDEEMED'
];

class GoogleVoucherDetails extends Component {
	constructor() {
		super();

		// bounds
		this.onGenerateCode = this.onGenerateCode.bind( this );
		this.onDialogCancel = this.onDialogCancel.bind( this );
		this.onAcceptTermsAndConditions = this.onAcceptTermsAndConditions.bind( this );
		this.onSetupGoogleAdWordsLink = this.onSetupGoogleAdWordsLink.bind( this );

		// debounced
		this.changeStep = debounce( this.changeStep, 300 );

		this.state = {
			step: INITIAL_STEP
		};
	}

	componentWillMount() {
		const voucher = this.getVoucher();
		if ( voucher && voucher.status === 'assigned' ) {
			this.setState( { step: CODE_REDEEMED } );
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
			this.setState( { step: CODE_REDEEMED } );
		}
	}

	onGenerateCode() {
		analytics.ga.recordEvent( 'calypso_plans_google_voucher_generate_click', 'Cliked Generate Code Button' );

		this.changeStep();
	}

	onDialogCancel() {
		this.setState( { step: INITIAL_STEP } );
	}

	onAcceptTermsAndConditions() {
		analytics.ga.recordEvent( 'calypso_plans_google_voucher_toc_accept_click', 'Cliked Agree Button' );

		this.props.assignVoucher( this.props.selectedSite.ID, GOOGLE_CREDITS );
		this.setState( { step: CODE_REDEEMED } );
	}

	onSetupGoogleAdWordsLink() {
		analytics.ga.recordEvent( 'calypso_plans_google_voucher_setup_click', 'Cliked Setup Goole AdWords Button' );
	}

	changeStep() {
		const newStep = ( this.state.step === INITIAL_STEP ) ? TERMS_AND_CONDITIONS : CODE_REDEEMED;
		this.setState( { step: newStep } );
	}

	getVoucher( props = this.props ) {
		const { googleAdCredits } = props;
		return googleAdCredits.length > 0 ? googleAdCredits[ 0 ] : {};
	}

	renderInitialStep() {
		return (
			<div>
				<PurchaseButton
					onClick={ this.onGenerateCode }
					text={ this.props.translate( 'Generate Code' ) } />

				<TipInfo
					info={ this.props.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
			</div>
		);
	}

	renderTermsAndConditions() {
		return (
			<Dialog
				isVisible={ true }
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
					{ termsAndConditions() }
				</div>

				<div className="google-voucher-dialog__footer">
					<PurchaseButton
						className="google-vouchers-dialog__cancel-button"
						primary={ false }
						onClick={ this.onDialogCancel }
						text={ this.props.translate( 'Cancel' ) } />

					<PurchaseButton
						className="google-vouchers-dialog__agree-button"
						onClick={ this.onAcceptTermsAndConditions }
						text={ this.props.translate( 'Agree' ) } />
				</div>
			</Dialog>
		);
	}

	renderCodeRedeemed() {
		const { code } = this.getVoucher();
		return (
			<div className="google-voucher">
				<ClipboardButtonInput
					value={ code }
					disabled= { ! code } />

				<div className="google-voucher-code">
					<p className="form-setting-explanation">
						{
							this.props.translate( 'Copy this unique, one-time use code to your clipboard and setup your Google AdWords account. {{a}}View help guide{{/a}}',
								{
									components: {
										a: <a
											className="google-voucher-code__help-link"
											href="https://en.support.wordpress.com/google-adwords-credit/"
											target="_blank" />
									}
								}
							)
						}
					</p>

					<PurchaseButton
						className="google-voucher-code__setup-google-adwords"
						href="https://www.google.com/adwords/"
						target="_blank"
						onClick= { this.onSetupGoogleAdWordsLink }
						text={ this.props.translate( 'Setup Google AdWords' ) } />

				</div>

				<TipInfo
					className="google-voucher-advice"
					info={ this.props.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
			</div>
		);
	}

	render() {
		const { selectedSite, translate } = this.props;
		const { step } = this.state;
		let body;

		switch ( step ) {
			case INITIAL_STEP:
				body = this.renderInitialStep();
				break;
			case TERMS_AND_CONDITIONS:
				body = this.renderTermsAndConditions();
				break;
			case CODE_REDEEMED:
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
