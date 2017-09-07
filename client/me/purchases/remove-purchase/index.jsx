/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import enrichedSurveyData
	from 'components/marketing-survey/cancel-purchase-form/enrichedSurveyData';
import initialSurveyState
	from 'components/marketing-survey/cancel-purchase-form/initialSurveyState';
import isSurveyFilledIn from 'components/marketing-survey/cancel-purchase-form/isSurveyFilledIn';
import stepsForProductAndSurvey
	from 'components/marketing-survey/cancel-purchase-form/stepsForProductAndSurvey';
import nextStep from 'components/marketing-survey/cancel-purchase-form/nextStep';
import previousStep from 'components/marketing-survey/cancel-purchase-form/previousStep';
import { INITIAL_STEP, FINAL_STEP } from 'components/marketing-survey/cancel-purchase-form/steps';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'lib/purchases';
import { getPurchase, isDataLoading } from '../utils';
import { isDomainRegistration, isPlan, isGoogleApps, isJetpackPlan } from 'lib/products-values';
import notices from 'notices';
import purchasePaths from '../paths';
import { getPurchasesError } from 'state/purchases/selectors';
import { removePurchase } from 'state/purchases/actions';
import { isHappychatAvailable, hasActiveHappychatSession } from 'state/happychat/selectors';
import FormSectionHeading from 'components/forms/form-section-heading';
import userFactory from 'lib/user';
import { isDomainOnlySite as isDomainOnly } from 'state/selectors';
import { receiveDeletedSite as receiveDeletedSiteDeprecated } from 'lib/sites-list/actions';
import { receiveDeletedSite } from 'state/sites/actions';
import { setAllSitesSelected } from 'state/ui/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import HappychatButton from 'components/happychat/button';

const user = userFactory();

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
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool, PropTypes.undefined ] ),
		setAllSitesSelected: PropTypes.func.isRequired,
	};

	state = {
		isDialogVisible: false,
		isRemoving: false,
		surveyStep: INITIAL_STEP,
		survey: initialSurveyState(),
	};

	recordChatEvent( eventAction ) {
		const purchase = this.props.selectedPurchase;
		this.props.recordTracksEvent( eventAction, {
			survey_step: this.state.surveyStep,
			purchase: purchase.productSlug,
			is_plan: isPlan( purchase ),
			is_domain_registration: isDomainRegistration( purchase ),
			has_included_domain: hasIncludedDomain( purchase ),
		} );
	}

	recordEvent = ( name, properties = {} ) => {
		const product_slug = get( this.props, 'selectedPurchase.productSlug' );
		const cancellation_flow = 'remove';
		this.props.recordTracksEvent(
			name,
			Object.assign( { cancellation_flow, product_slug }, properties )
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
		const { selectedPurchase, isChatAvailable, isChatActive } = this.props;
		const { surveyStep, survey } = this.state;
		const steps = stepsForProductAndSurvey(
			survey,
			selectedPurchase,
			isChatAvailable || isChatActive
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

		const purchase = getPurchase( this.props );
		const { isDomainOnlySite, selectedSite, translate } = this.props;

		if ( ! isDomainRegistration( purchase ) && config.isEnabled( 'upgrades/removal-survey' ) ) {
			this.recordEvent( 'calypso_purchases_cancel_form_submit' );

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

		this.props
			.removePurchase( purchase.id, user.get().ID )
			.then( () => {
				const productName = getName( purchase );
				const { purchasesError } = this.props;

				if ( purchasesError ) {
					this.setState( { isRemoving: false } );

					closeDialog();

					notices.error( purchasesError );
				} else {
					if ( isDomainRegistration( purchase ) ) {
						if ( isDomainOnlySite ) {
							// Removing the domain from a domain-only site results
							// in the site being deleted entirely. We need to call
							// `receiveDeletedSiteDeprecated` here because the site
							// exists in `sites-list` as well as the global store.
							receiveDeletedSiteDeprecated( selectedSite );
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

					page( purchasePaths.purchasesRoot() );
				}
			} );
	};

	renderCard = () => {
		const { translate } = this.props;
		const productName = getName( getPurchase( this.props ) );

		return (
			<CompactCard className="remove-purchase__card" onClick={ this.openDialog }>
				<a href="#">
					<Gridicon icon="trash" />
					{ translate( 'Remove %(productName)s', { args: { productName } } ) }
				</a>
			</CompactCard>
		);
	};

	getChatButton = () => {
		return (
			<HappychatButton className="remove-purchase__chat-button" onClick={ this.chatButtonClicked }>
				{ this.props.translate( 'Need help? Chat with us' ) }
			</HappychatButton>
		);
	};

	renderDomainDialog = () => {
		const { translate } = this.props;
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
		const productName = getName( getPurchase( this.props ) );

		if ( config.isEnabled( 'upgrades/precancellation-chat' ) ) {
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
				{ this.renderDomainDialogText() }
			</Dialog>
		);
	};

	renderDomainDialogText = () => {
		const { translate } = this.props;
		const purchase = getPurchase( this.props ), productName = getName( purchase );

		return (
			<p>
				{ translate(
					'This will remove %(domain)s from your account. By removing, ' +
						'you are canceling the domain registration. This may stop ' +
						'you from using it again, even with another service.',
					{ args: { domain: productName } }
				) }
			</p>
		);
	};

	renderPlanDialogs = () => {
		const { selectedPurchase, translate } = this.props;
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
			buttonsArr = this.state.surveyStep === INITIAL_STEP
				? [ buttons.cancel, buttons.next ]
				: [ buttons.cancel, buttons.prev, buttons.next ];
		}

		if ( config.isEnabled( 'upgrades/precancellation-chat' ) ) {
			buttonsArr.unshift( this.getChatButton() );
		}

		return (
			<div>
				<Dialog
					buttons={ buttonsArr }
					className="remove-purchase__dialog"
					isVisible={ this.state.isDialogVisible }
					onClose={ this.closeDialog }
				>
					<CancelPurchaseForm
						chatInitiated={ this.chatInitiated }
						productName={ getName( selectedPurchase ) }
						surveyStep={ this.state.surveyStep }
						showSurvey={ config.isEnabled( 'upgrades/removal-survey' ) }
						defaultContent={ this.renderPlanDialogsText() }
						onInputChange={ this.onSurveyChange }
						isJetpack={ isJetpackPlan( selectedPurchase ) }
					/>
				</Dialog>
			</div>
		);
	};

	renderPlanDialogsText = () => {
		const { translate } = this.props;
		const purchase = getPurchase( this.props ),
			productName = getName( purchase ),
			includedDomainText = (
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
					} ) }
					{ ' ' }
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
	};

	render() {
		if ( isDataLoading( this.props ) || ! this.props.selectedSite ) {
			return null;
		}

		const purchase = getPurchase( this.props );
		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		return (
			<span>
				{ this.renderCard() }
				{ isDomainRegistration( purchase ) ? this.renderDomainDialog() : this.renderPlanDialogs() }
			</span>
		);
	}
}

export default connect(
	( state, { selectedSite } ) => ( {
		isDomainOnlySite: isDomainOnly( state, selectedSite && selectedSite.ID ),
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		purchasesError: getPurchasesError( state ),
	} ),
	{
		receiveDeletedSite,
		recordTracksEvent,
		removePurchase,
		setAllSitesSelected,
	}
)( localize( RemovePurchase ) );
