/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import PurchaseButton from 'components/purchase-detail/purchase-button';
import TipInfo from 'components/purchase-detail/tip-info';
import { gaRecordEvent } from 'lib/analytics/ga';
import TermsAndConditions from './terms-and-conditions';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import { assignSiteVoucher as assignVoucher } from 'state/sites/vouchers/actions';
import { GOOGLE_CREDITS } from 'state/sites/vouchers/service-types';
import { getVouchersBySite, getGoogleAdCredits } from 'state/sites/vouchers/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

const [ INITIAL_STEP, TERMS_AND_CONDITIONS, CODE_REDEEMED ] = [
	'INITIAL_STEP',
	'TERMS_AND_CONDITIONS',
	'CODE_REDEEMED',
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
			step: INITIAL_STEP,
		};
	}

	UNSAFE_componentWillMount() {
		const voucher = this.getVoucher();
		if ( voucher && voucher.status === 'assigned' ) {
			this.setState( { step: CODE_REDEEMED } );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
		gaRecordEvent( 'calypso_plans_google_voucher_generate_click', 'Clicked Generate Code Button' );
		this.props.recordTracksEvent( 'calypso_google_adwords_voucher_generate_click' );

		this.changeStep();
	}

	onDialogCancel() {
		this.props.recordTracksEvent( 'calypso_google_adwords_voucher_tos_dialog_cancel_click' );
		this.setState( { step: INITIAL_STEP } );
	}

	onAcceptTermsAndConditions() {
		gaRecordEvent( 'calypso_plans_google_voucher_toc_accept_click', 'Clicked Agree Button' );
		this.props.recordTracksEvent( 'calypso_google_adwords_voucher_tos_accept_click' );

		this.props.assignVoucher( this.props.selectedSite.ID, GOOGLE_CREDITS );
		this.setState( { step: CODE_REDEEMED } );
	}

	onSetupGoogleAdWordsLink() {
		gaRecordEvent( 'calypso_plans_google_voucher_setup_click', 'Clicked Setup Google Ads Button' );
		this.props.recordTracksEvent( 'calypso_google_adwords_voucher_setup_click' );
	}

	changeStep() {
		const newStep = this.state.step === INITIAL_STEP ? TERMS_AND_CONDITIONS : CODE_REDEEMED;
		this.setState( { step: newStep } );
	}

	getVoucher( props = this.props ) {
		const { googleAdCredits } = props;
		return googleAdCredits.length > 0 ? googleAdCredits[ 0 ] : {};
	}

	renderInitialStep() {
		return (
			<div className="google-voucher__initial-step">
				<PurchaseButton
					onClick={ this.onGenerateCode }
					primary={ false }
					text={ this.props.translate( 'Generate code' ) }
				/>

				<TipInfo
					info={ this.props.translate(
						'Offer valid in US and CA after spending the first %(cost)s on Google Ads.',
						{
							args: {
								cost: '$25',
							},
						}
					) }
				/>
			</div>
		);
	}

	renderTermsAndConditions() {
		return (
			<Dialog
				isVisible={ true }
				onClose={ this.onDialogCancel }
				additionalClassNames="google-voucher__dialog"
			>
				<div className="google-voucher__dialog-header">
					<img
						alt=""
						src="/calypso/images/google-vouchers/google-voucher.svg"
						className="google-voucher__dialog-header-image"
					/>

					<div className="google-voucher__dialog-header-text">
						<h1>{ this.props.translate( 'Terms of Service' ) }</h1>
						<p>{ this.props.translate( 'Google Ads credit' ) }</p>
					</div>
				</div>

				<div className="google-voucher__dialog-body">
					<TermsAndConditions />
				</div>

				<div className="google-voucher__dialog-footer">
					<Button className="google-voucher__dialog-cancel-button" onClick={ this.onDialogCancel }>
						{ this.props.translate( 'Cancel' ) }
					</Button>

					<Button
						className="google-voucher__dialog-agree-button"
						onClick={ this.onAcceptTermsAndConditions }
						primary={ true }
					>
						{ this.props.translate( 'Agree' ) }
					</Button>
				</div>
			</Dialog>
		);
	}

	renderCodeRedeemed() {
		const { code } = this.getVoucher();
		return (
			<div className="google-voucher__code-redeemed">
				<ClipboardButtonInput value={ code } disabled={ ! code } />

				<div className="google-voucher__copy-code">
					<FormSettingExplanation className="google-voucher__explanation">
						{ this.props.translate(
							'Copy this unique, one-time use code to your clipboard and setup your Google Ads account. {{a}}View help guide{{/a}}',
							{
								components: {
									a: (
										<a
											className="google-voucher__help-link"
											href={ localizeUrl( 'https://wordpress.com/support/google-ads-credit/' ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</FormSettingExplanation>

					<PurchaseButton
						className="google-voucher__setup-google-adwords"
						href="https://ads.google.com/home/"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.onSetupGoogleAdWordsLink }
						primary={ false }
						text={ this.props.translate( 'Setup Google Ads' ) }
					/>
				</div>

				<TipInfo
					className="google-voucher__advice"
					info={ this.props.translate(
						'Offer valid in US and CA after spending the first %(cost)s on Google Ads.',
						{
							args: {
								cost: '$25',
							},
						}
					) }
				/>
			</div>
		);
	}

	render() {
		const { selectedSite } = this.props;
		const { step } = this.state;
		let body;

		if ( ! selectedSite.ID ) {
			return null;
		}

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
				{ body }
			</div>
		);
	}
}

GoogleVoucherDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	googleAdCredits: PropTypes.array,
	recordTracksEvent: PropTypes.func.isRequired,
};

export default connect(
	( state, props ) => {
		const site = props.selectedSite || getSelectedSite( state ) || {};

		return {
			selectedSite: site,
			vouchers: getVouchersBySite( state, site ),
			googleAdCredits: getGoogleAdCredits( state, site ),
		};
	},
	{
		assignVoucher,
		recordTracksEvent: recordTracksEventAction,
	}
)( localize( GoogleVoucherDetails ) );
