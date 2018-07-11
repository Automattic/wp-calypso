/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import initialSurveyState from 'components/marketing-survey/cancel-purchase-form/initial-survey-state';
import isSurveyFilledIn from 'components/marketing-survey/cancel-purchase-form/is-survey-filled-in';
import stepsForProductAndSurvey from 'components/marketing-survey/cancel-purchase-form/steps-for-product-and-survey';
import nextStep from 'components/marketing-survey/cancel-purchase-form/next-step';
import previousStep from 'components/marketing-survey/cancel-purchase-form/previous-step';
import { INITIAL_STEP, FINAL_STEP } from 'components/marketing-survey/cancel-purchase-form/steps';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'lib/purchases';
import { isDataLoading } from '../utils';
import { isDomainRegistration, isPlan, isBusiness, isGoogleApps } from 'lib/products-values';
import notices from 'notices';
import { purchasesRoot } from '../paths';
import { getPurchasesError } from 'state/purchases/selectors';
import { removePurchase } from 'state/purchases/actions';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import FormSectionHeading from 'components/forms/form-section-heading';
import isDomainOnly from 'state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { receiveDeletedSite } from 'state/sites/actions';
import { setAllSitesSelected } from 'state/ui/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import HappychatButton from 'components/happychat/button';
import isPrecancellationChatAvailable from 'state/happychat/selectors/is-precancellation-chat-available';
import { getCurrentUserId } from 'state/current-user/selectors';

/**
 * Module dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:purchases:survey' );

class RemovePurchase extends Component {
	static propTypes = {
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		isDomainOnlySite: PropTypes.bool,
		receiveDeletedSite: PropTypes.func.isRequired,
		removePurchase: PropTypes.func.isRequired,
		purchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		setAllSitesSelected: PropTypes.func.isRequired,
		userId: PropTypes.number.isRequired,
	};

	state = {
		isDialogVisible: false,
		isRemoving: false,
		surveyStep: INITIAL_STEP,
		survey: initialSurveyState(),
	};

	recordChatEvent( eventAction ) {
		const { purchase } = this.props;
		this.props.recordTracksEvent( eventAction, {
			survey_step: this.state.surveyStep,
			purchase: purchase.productSlug,
			is_plan: isPlan( purchase ),
			is_domain_registration: isDomainRegistration( purchase ),
			has_included_domain: hasIncludedDomain( purchase ),
		} );
	}

	recordEvent = ( name, properties = {} ) => {
		const product_slug = get( this.props, [ 'purchase', 'productSlug' ] );
		const cancellation_flow = 'remove';
		const is_atomic = this.props.isAutomatedTransferSite;
		this.props.recordTracksEvent(
			name,
			Object.assign( { cancellation_flow, product_slug, is_atomic }, properties )
		);
	};

	closeDialog = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_close' );
		this.setState( {
			isDialogVisible: false,
			surveyStep: INITIAL_STEP,
			survey: initialSurveyState(),
		} );
	};

	chatInitiated = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_chat_initiated' );
		this.closeDialog();
	};

	openDialog = event => {
		this.recordEvent( 'calypso_purchases_cancel_form_start' );
		event.preventDefault();

		this.setState( { isDialogVisible: true } );
	};

	chatButtonClicked = event => {
		this.recordChatEvent( 'calypso_precancellation_chat_click' );
		event.preventDefault();

		this.setState( { isDialogVisible: false } );
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
		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
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

	removePurchase = closeDialog => {
		this.setState( { isRemoving: true } );

		const { isDomainOnlySite, purchase, selectedSite, translate } = this.props;

		if ( ! isDomainRegistration( purchase ) && config.isEnabled( 'upgrades/removal-survey' ) ) {
			const survey = wpcom
				.marketing()
				.survey( 'calypso-remove-purchase', this.props.selectedSite.ID );
			const surveyData = {
				'why-cancel': {
					response: this.state.survey.questionOneRadio,
					text: this.state.survey.questionOneText,
				},
				'next-adventure': {
					response: this.state.survey.questionTwoRadio,
					text: this.state.survey.questionTwoText,
				},
				'what-better': { text: this.state.survey.questionThreeText },
				type: 'remove',
			};

			survey.addResponses( enrichedSurveyData( surveyData, moment(), selectedSite, purchase ) );

			debug( 'Survey responses', survey );
			survey
				.submit()
				.then( res => {
					debug( 'Survey submit response', res );
					if ( ! res.success ) {
						notices.error( res.err );
					}
				} )
				.catch( err => debug( err ) ); // shouldn't get here
		}

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );

		this.props.removePurchase( purchase.id, this.props.userId ).then( () => {
			const productName = getName( purchase );
			const { purchasesError } = this.props;

			if ( purchasesError ) {
				this.setState( { isRemoving: false } );

				closeDialog();

				notices.error( purchasesError );
			} else {
				if ( isDomainRegistration( purchase ) ) {
					if ( isDomainOnlySite ) {
						this.props.receiveDeletedSite( selectedSite.ID );
						this.props.setAllSitesSelected();
					}

					notices.success(
						translate( 'The domain {{domain/}} was removed from your account.', {
							components: { domain: <em>{ productName }</em> },
						} ),
						{ persistent: true }
					);
				} else {
					notices.success(
						translate( '%(productName)s was removed from {{siteName/}}.', {
							args: { productName },
							components: { siteName: <em>{ selectedSite.domain }</em> },
						} ),
						{ persistent: true }
					);
				}

				page( purchasesRoot );
			}
		} );
	};

	getChatButton = () => {
		return (
			<HappychatButton className="remove-purchase__chat-button" onClick={ this.chatButtonClicked }>
				{ this.props.translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	};

	getContactUsButton = () => {
		return (
			<Button className="remove-purchase__support-link-button" href="/help/contact/">
				{ this.props.translate( 'Contact Us' ) }
			</Button>
		);
	};

	renderDomainDialog() {
		const { purchase, translate } = this.props;
		const productName = getName( purchase );
		const buttons = [
			{
				action: 'cancel',
				disabled: this.state.isRemoving,
				label: translate( 'Cancel' ),
			},
			{
				action: 'remove',
				disabled: this.state.isRemoving,
				isPrimary: true,
				label: translate( 'Remove Now' ),
				onClick: this.removePurchase,
			},
		];

		if (
			config.isEnabled( 'upgrades/precancellation-chat' ) &&
			this.state.surveyStep !== 'happychat_step'
		) {
			buttons.unshift( this.getChatButton() );
		}

		return (
			<Dialog
				buttons={ buttons }
				className="remove-purchase__dialog"
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
			>
				<FormSectionHeading>
					{ translate( 'Remove %(productName)s', { args: { productName } } ) }
				</FormSectionHeading>
				<p>
					{ translate(
						'This will remove %(domain)s from your account. By removing, ' +
							'you are canceling the domain registration. This may stop ' +
							'you from using it again, even with another service.',
						{ args: { domain: productName } }
					) }
				</p>
			</Dialog>
		);
	}

	renderPlanDialog() {
		const { purchase, selectedSite, translate } = this.props;
		const buttons = {
			cancel: {
				action: 'cancel',
				disabled: this.state.isRemoving,
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
			remove: {
				action: 'remove',
				disabled: this.state.isRemoving,
				isPrimary: true,
				label: translate( 'Remove Now' ),
				onClick: this.removePurchase,
			},
		};

		let buttonsArr;
		if ( ! config.isEnabled( 'upgrades/removal-survey' ) ) {
			buttonsArr = [ buttons.cancel, buttons.remove ];
		} else if ( this.state.surveyStep === FINAL_STEP ) {
			buttonsArr = [ buttons.cancel, buttons.prev, buttons.remove ];
		} else {
			buttonsArr =
				this.state.surveyStep === INITIAL_STEP
					? [ buttons.cancel, buttons.next ]
					: [ buttons.cancel, buttons.prev, buttons.next ];
		}

		if (
			config.isEnabled( 'upgrades/precancellation-chat' ) &&
			this.state.surveyStep !== 'happychat_step'
		) {
			buttonsArr.unshift( this.getChatButton() );
		}

		return (
			<Dialog
				buttons={ buttonsArr }
				className="remove-purchase__dialog"
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
			>
				<CancelPurchaseForm
					chatInitiated={ this.chatInitiated }
					defaultContent={ this.renderPlanDialogText() }
					onInputChange={ this.onSurveyChange }
					purchase={ purchase }
					selectedSite={ selectedSite }
					showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
					surveyStep={ this.state.surveyStep }
				/>
			</Dialog>
		);
	}

	renderPlanDialogText() {
		const { purchase, translate } = this.props;
		const productName = getName( purchase );
		const includedDomainText = (
			<p>
				{ translate(
					'The domain associated with this plan, {{domain/}}, will not be removed. ' +
						'It will remain active on your site, unless also removed.',
					{ components: { domain: <em>{ getIncludedDomain( purchase ) }</em> } }
				) }
			</p>
		);

		return (
			<div>
				<p>
					{ translate( 'Are you sure you want to remove %(productName)s from {{siteName/}}?', {
						args: { productName },
						components: { siteName: <em>{ this.props.selectedSite.domain }</em> },
					} ) }{' '}
					{ isGoogleApps( purchase )
						? translate(
								'Your G Suite account will continue working without interruption. ' +
									'You will be able to manage your G Suite billing directly through Google.'
						  )
						: translate(
								'You will not be able to reuse it again without purchasing a new subscription.',
								{ comment: "'it' refers to a product purchased by a user" }
						  ) }
				</p>

				{ isPlan( purchase ) && hasIncludedDomain( purchase ) && includedDomainText }
			</div>
		);
	}

	renderAtomicDialog( purchase ) {
		const { translate } = this.props;
		const supportButton = this.state.isChatAvailable
			? this.getChatButton()
			: this.getContactUsButton();

		const buttons = [
			supportButton,
			{
				action: 'cancel',
				disabled: this.state.isRemoving,
				isPrimary: true,
				label: translate( "I'll Keep It" ),
			},
		];
		const productName = getName( purchase );

		return (
			<Dialog
				buttons={ buttons }
				className="remove-purchase__dialog"
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
			>
				<FormSectionHeading />
				<p>
					{ translate(
						'To cancel your %(productName)s plan, please contact our support team' +
							' — a Happiness Engineer will take care of it.',
						{
							args: { productName },
						}
					) }
				</p>
			</Dialog>
		);
	}

	renderDialog( purchase ) {
		if (
			this.props.isAutomatedTransferSite &&
			( isDomainRegistration( purchase ) || isBusiness( purchase ) )
		) {
			return this.renderAtomicDialog( purchase );
		}

		if ( isDomainRegistration( purchase ) ) {
			return this.renderDomainDialog();
		}

		return this.renderPlanDialog();
	}

	render() {
		if ( isDataLoading( this.props ) || ! this.props.selectedSite ) {
			return null;
		}

		const { purchase, translate } = this.props;
		const productName = getName( purchase );

		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		return (
			<Fragment>
				<CompactCard tagName="button" className="remove-purchase__card" onClick={ this.openDialog }>
					<Gridicon icon="trash" />
					{ translate( 'Remove %(productName)s', { args: { productName } } ) }
				</CompactCard>

				{ this.renderDialog( purchase ) }
			</Fragment>
		);
	}
}

export default connect(
	( state, { selectedSite } ) => ( {
		isDomainOnlySite: selectedSite && isDomainOnly( state, selectedSite.ID ),
		isAutomatedTransferSite: selectedSite && isSiteAutomatedTransfer( state, selectedSite.ID ),
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		purchasesError: getPurchasesError( state ),
		precancellationChatAvailable: isPrecancellationChatAvailable( state ),
		userId: getCurrentUserId( state ),
	} ),
	{
		receiveDeletedSite,
		recordTracksEvent,
		removePurchase,
		setAllSitesSelected,
	}
)( localize( RemovePurchase ) );
