/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import { isDomainRegistration, isPlan } from 'lib/products-values';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import './style.scss';

// import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import initialSurveyState from 'components/marketing-survey/cancel-purchase-form/initial-survey-state';
import isSurveyFilledIn from 'components/marketing-survey/cancel-purchase-form/is-survey-filled-in';
import stepsForProductAndSurvey from 'components/marketing-survey/cancel-purchase-form/steps-for-product-and-survey';
import nextStep from 'components/marketing-survey/cancel-purchase-form/next-step';
import previousStep from 'components/marketing-survey/cancel-purchase-form/previous-step';
import { INITIAL_STEP, FINAL_STEP } from 'components/marketing-survey/cancel-purchase-form/steps';

class AutoRenewDisablingDialog extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		purchase: PropTypes.object.isRequired,
	};

	state = {
		showAtomicFollowUpDialog: false,
		dialogNo: 2,
		surveyStep: INITIAL_STEP,
		survey: initialSurveyState(),
	};

	getVariation() {
		const { purchase, isAtomicSite } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			return 'domain';
		}

		if ( isPlan( purchase ) && isAtomicSite ) {
			return 'atomic';
		}

		if ( isPlan( purchase ) ) {
			return 'plan';
		}

		return null;
	}

	getCopy( variation ) {
		const { planName, siteDomain, purchase, translate } = this.props;

		const expiryDate = purchase.expiryMoment.format( 'LL' );

		switch ( variation ) {
			case 'plan':
				return translate(
					'By canceling auto-renewal, your %(planName)s plan for %(siteDomain)s will expire on %(expiryDate)s. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'domain':
				return translate(
					'By canceling auto-renewal, your domain %(domain)s will expire on %(expiryDate)s. ' +
						"Once your domain expires, there is no guarantee that you'll be able to get it back – " +
						'it could become unavailable and be impossible to purchase here, or at any other domain registrar. ' +
						'To avoid that, turn auto-renewal back on or manually renew your domain before the expiration date.',
					{
						args: {
							// in case of a domain registration, we need the actual domain bound to this purchase instead of the primary domain bound to the site.
							domain: purchase.meta,
							expiryDate,
						},
						comment:
							'%(domain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'atomic':
				return translate(
					'By canceling auto-renewal, your %(planName)s plan for %(siteDomain)s will expire on %(expiryDate)s. ' +
						'When it does, you will lose plugins, themes, design customizations, and possibly some content. ' +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
		}
	}

	onClickAtomicFollowUpConfirm = () => {
		// this.props.onConfirm() || this.props.onClose();
		this.setState( {
			dialogNo: 1,
		} );
	};

	renderAtomicFollowUpDialog = () => {
		const { siteDomain, onClose, translate } = this.props;

		const exportPath = '//' + siteDomain + '/wp-admin/export.php';

		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="auto-renew-disabling-dialog atomic-follow-up"
				onClose={ onClose }
			>
				<p>
					{ translate(
						'Before you continue, we recommend downloading a backup of your site – ' +
							"that way, you'll have your content to use on any future websites you create."
					) }
				</p>
				<ul>
					<li>
						<Button href={ exportPath } primary>
							{ translate( 'Download a backup' ) }
						</Button>
					</li>
					<li>
						<Button onClick={ this.onClickAtomicFollowUpConfirm }>
							{ translate(
								"I don't need a backup OR I already have a backup. Cancel my auto-renewal."
							) }
						</Button>
					</li>
				</ul>
			</Dialog>
		);
	};

	onClickGeneralConfirm = () => {
		if ( 'atomic' === this.getVariation() ) {
			this.setState( {
				// showAtomicFollowUpDialog: true,
				dialogNo: 0,
			} );
			return;
		}

		this.setState( {
			dialogNo: 1,
		} );

		// this.props.onConfirm() || this.props.onClose();
	};

	closeDialog = () => {
		// this.recordEvent( 'calypso_purchases_cancel_form_close' );

		this.setState( {
			showDialog: false,
			surveyStep: INITIAL_STEP,
			survey: initialSurveyState(),
		} );

		this.props.onClose();
		// this.props.onConfirm() || this.props.onClose();
	};

	changeSurveyStep = stepFunction => {
		const { purchase, isChatAvailable, isChatActive, precancellationChatAvailable } = this.props;
		const { surveyStep, survey } = this.state;
		const steps = stepsForProductAndSurvey(
			survey,
			purchase,
			isChatAvailable || isChatActive,
			precancellationChatAvailable
		);
		const newStep = stepFunction( surveyStep, steps );
		// this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
		this.setState( { surveyStep: newStep } );
	};

	clickNext = () => {
		if ( this.state.isRemoving || ! isSurveyFilledIn( this.state.survey ) ) {
			return;
		}
		this.changeSurveyStep( nextStep );
	};

	clickPrevious = () => {
		if ( this.state.isRemoving ) {
			return;
		}
		this.changeSurveyStep( previousStep );
	};

	onSurveyChange = update => {
		this.setState( {
			survey: update,
		} );
	};

	renderCancelConfirmationDialog = () => {
		const { purchase, selectedSite, translate } = this.props;
		const buttons = {
			close: {
				action: 'close',
				label: translate( "I'll Keep It" ),
			},
			next: {
				action: 'next',
				disabled: this.state.isRemoving || ! isSurveyFilledIn( this.state.survey ),
				label: translate( 'Next Step' ),
				onClick: this.clickNext,
			},
			prev: {
				action: 'prev',
				disabled: this.state.isRemoving,
				label: translate( 'Previous Step' ),
				onClick: this.clickPrevious,
			},
			cancel: {
				action: 'cancel',
				label: translate( 'Cancel Now' ),
				isPrimary: true,
				disabled: this.state.submitting,
				onClick: () => this.props.onConfirm() || this.props.onClose(),
			},
		};

		let buttonsArr;
		if ( this.state.surveyStep === FINAL_STEP ) {
			buttonsArr = [ buttons.close, buttons.prev, buttons.cancel ];
		} else {
			buttonsArr =
				this.state.surveyStep === INITIAL_STEP
					? [ buttons.close, buttons.next ]
					: [ buttons.close, buttons.prev, buttons.next ];
		}

		return (
			<Dialog
				isVisible={ true }
				buttons={ buttonsArr }
				onClose={ this.closeDialog }
				className="cancel-purchase__button-warning-dialog"
			>
				<CancelPurchaseForm
					chatInitiated={ false }
					defaultContent={ '' }
					onInputChange={ this.onSurveyChange }
					purchase={ purchase }
					selectedSite={ selectedSite }
					showSurvey={ true }
					surveyStep={ this.state.surveyStep }
				/>
			</Dialog>
		);
	};

	renderGeneralDialog = () => {
		const { onClose, translate } = this.props;
		const description = this.getCopy( this.getVariation() );

		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="auto-renew-disabling-dialog"
				onClose={ onClose }
			>
				<h2 className="auto-renew-disabling-dialog__header">{ translate( 'Before you go…' ) }</h2>
				<p>{ description }</p>
				<Button onClick={ this.onClickGeneralConfirm } primary>
					{ translate( 'Confirm cancellation' ) }
				</Button>
			</Dialog>
		);
	};

	render() {
		// return this.state.showAtomicFollowUpDialog
		// 	? this.renderAtomicFollowUpDialog()
		// 	: this.renderGeneralDialog();
		// return this.state.showAtomicFollowUpDialog
		// 	? this.renderAtomicFollowUpDialog()
		// 	: this.renderCancelConfirmationDialog();

		switch ( this.state.dialogNo ) {
			case 0:
				return this.renderAtomicFollowUpDialog();
			case 1:
				return this.renderCancelConfirmationDialog();
			case 2:
				return this.renderGeneralDialog();
		}
	}
}

export default connect( ( state, { purchase } ) => ( {
	isAtomicSite: isSiteAtomic( state, purchase.siteId ),
} ) )( localize( AutoRenewDisablingDialog ) );
