/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { shuffle } from 'lodash';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { submitSurvey } from 'lib/upgrades/actions';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormSectionHeading from 'components/forms/form-section-heading';
import { recordTracksEvent } from 'state/analytics/actions';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import isPrecancellationChatAvailable from 'state/happychat/selectors/is-precancellation-chat-available';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import * as steps from './steps';
import initialSurveyState from './initial-survey-state';
import BusinessATStep from './step-components/business-at-step';
import UpgradeATStep from './step-components/upgrade-at-step';
import PrecancellationChatButton from './precancellation-chat-button';
import { getName } from 'lib/purchases';
import { isGoogleApps } from 'lib/products-values';
import { radioOption } from './radio-option';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './options-for-product';
import nextStep from './next-step';
import previousStep from './previous-step';
import isSurveyFilledIn from './is-survey-filled-in';
import stepsForProductAndSurvey from './steps-for-product-and-survey';
import enrichedSurveyData from './enriched-survey-data';
import { CANCEL_FLOW_TYPE } from './constants';

/**
 * Style dependencies
 */
import './style.scss';

class CancelPurchaseForm extends React.Component {
	static propTypes = {
		defaultContent: PropTypes.node.isRequired,
		disableButtons: PropTypes.bool,
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.shape( { slug: PropTypes.string.isRequired } ),
		isVisible: PropTypes.bool,
		onInputChange: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onClickFinalConfirm: PropTypes.func.isRequired,
		flowType: PropTypes.string.isRequired,
		showSurvey: PropTypes.bool.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		defaultContent: '',
		onInputChange: () => {},
		showSurvey: true,
		isVisible: false,
	};

	getAllSurveySteps = () => {
		const { purchase, isChatAvailable, isChatActive, precancellationChatAvailable } = this.props;

		return stepsForProductAndSurvey(
			this.state,
			purchase,
			isChatAvailable || isChatActive,
			precancellationChatAvailable
		);
	};

	initSurveyState() {
		const [ firstStep ] = this.getAllSurveySteps();

		this.setState( {
			surveyStep: firstStep,
			...initialSurveyState(),
		} );
	}

	constructor( props ) {
		super( props );

		const { purchase } = props;
		const questionOneOrder = shuffle( cancellationOptionsForPurchase( purchase ) );
		const questionTwoOrder = shuffle( nextAdventureOptionsForPurchase( purchase ) );

		questionOneOrder.push( 'anotherReasonOne' );

		if ( questionTwoOrder.length > 0 ) {
			questionTwoOrder.push( 'anotherReasonTwo' );
		}

		this.state = {
			questionOneText: '',
			questionOneOrder: questionOneOrder,
			questionTwoText: '',
			questionTwoOrder: questionTwoOrder,
			questionThreeText: '',

			isSubmitting: false,
		};
	}

	recordEvent = ( name, properties = {} ) => {
		const { purchase, flowType, isAtomicSite } = this.props;

		this.props.recordTracksEvent( name, {
			cancellation_flow: flowType,
			product_slug: purchase.productSlug,
			is_atomic: isAtomicSite,

			...properties,
		} );
	};

	recordClickRadioEvent = ( option, value ) =>
		this.props.recordTracksEvent( 'calypso_purchases_cancel_form_select_radio_option', {
			option,
			value,
		} );

	onRadioOneChange = event => {
		this.recordClickRadioEvent( 'radio_1', event.currentTarget.value );

		const newState = {
			...this.state,
			questionOneRadio: event.currentTarget.value,
			questionOneText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextOneChange = event => {
		const newState = {
			...this.state,
			questionOneText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onRadioTwoChange = event => {
		this.recordClickRadioEvent( 'radio_2', event.currentTarget.value );

		const newState = {
			...this.state,
			questionTwoRadio: event.currentTarget.value,
			questionTwoText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextTwoChange = event => {
		const newState = {
			...this.state,
			questionTwoText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextThreeChange = event => {
		const newState = {
			...this.state,
			questionThreeText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	// Because of the legacy reason, we can't just use `flowType` here.
	// Instead we have to map it to the data keys defined way before `flowType` is introduced.
	getSurveyDataType = () => {
		switch ( this.props.flowType ) {
			case CANCEL_FLOW_TYPE.REMOVE:
				return 'remove';
			case CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND:
				return 'refund';
			case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW:
				return 'cancel-autorenew';
			case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW_SURVEY_ONLY:
				return 'cancel-autorenew-survey-only';
			default:
				// Although we shouldn't allow it to reach here, we still include this default in case we forgot to add proper mappings.
				return 'general';
		}
	};

	onSubmit = () => {
		const { purchase, selectedSite } = this.props;

		if ( ! isGoogleApps( purchase ) ) {
			this.setState( {
				isSubmitting: true,
			} );

			const surveyData = {
				'why-cancel': {
					response: this.state.questionOneRadio,
					text: this.state.questionOneText,
				},
				'next-adventure': {
					response: this.state.questionTwoRadio,
					text: this.state.questionTwoText,
				},
				'what-better': { text: this.state.questionThreeText },
				type: this.getSurveyDataType(),
			};

			submitSurvey(
				'calypso-remove-purchase',
				selectedSite.ID,
				enrichedSurveyData( surveyData, moment(), selectedSite, purchase )
			).then( () => {
				this.setState( {
					isSubmitting: false,
				} );
			} );
		}

		this.props.onClickFinalConfirm();

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	renderQuestionOne = () => {
		const reasons = {};
		const { translate } = this.props;
		const { questionOneOrder, questionOneRadio, questionOneText } = this.state;

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			( reasons[ key ] = radioOption(
				key,
				questionOneRadio,
				questionOneText,
				this.onRadioOneChange,
				this.onTextOneChange,
				radioPrompt,
				textPlaceholder
			) );

		appendRadioOption(
			'couldNotInstall',
			translate( "I couldn't install a plugin/theme I wanted." ),
			translate( 'What plugin/theme were you trying to install?' )
		);

		appendRadioOption(
			'tooHard',
			translate( 'It was too hard to set up my site.' ),
			translate( 'Where did you run into problems?' )
		);

		appendRadioOption(
			'didNotInclude',
			translate( "This upgrade didn't include what I needed." ),
			translate( 'What are we missing that you need?' )
		);

		appendRadioOption(
			'onlyNeedFree',
			translate( 'The plan was too expensive.' ),
			translate( 'How can we improve our upgrades?' )
		);

		appendRadioOption(
			'couldNotActivate',
			translate( 'I was unable to activate or use the product.' ),
			translate( 'Where did you run into problems?' )
		);

		appendRadioOption(
			'noLongerWantToTransfer',
			translate( 'I no longer want to transfer my domain.' )
		);

		appendRadioOption(
			'couldNotCompleteTransfer',
			translate( 'Something went wrong and I could not complete the transfer.' )
		);

		appendRadioOption(
			'useDomainWithoutTransferring',
			translate( 'I’m going to use my domain with WordPress.com without transferring it.' )
		);

		appendRadioOption( 'anotherReasonOne', translate( 'Another reason…' ), ' ' );

		return (
			<div>
				<FormLegend>{ translate( 'Please tell us why you are canceling:' ) }</FormLegend>
				{ questionOneOrder.map( question => reasons[ question ] ) }
			</div>
		);
	};

	renderQuestionTwo = () => {
		const reasons = {};
		const { translate } = this.props;
		const { questionTwoOrder, questionTwoRadio, questionTwoText } = this.state;

		if ( questionTwoOrder.length === 0 ) {
			return null;
		}

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			( reasons[ key ] = radioOption(
				key,
				questionTwoRadio,
				questionTwoText,
				this.onRadioTwoChange,
				this.onTextTwoChange,
				radioPrompt,
				textPlaceholder
			) );

		appendRadioOption( 'stayingHere', translate( "I'm staying here and using the free plan." ) );

		appendRadioOption(
			'otherWordPress',
			translate( "I'm going to use WordPress somewhere else." ),
			translate( 'Mind telling us where?' )
		);

		appendRadioOption(
			'differentService',
			translate( "I'm going to use a different service for my website or blog." ),
			translate( 'Mind telling us which one?' )
		);

		appendRadioOption(
			'noNeed',
			translate( 'I no longer need a website or blog.' ),
			translate( 'What will you do instead?' )
		);

		appendRadioOption(
			'otherPlugin',
			translate( 'I found a better plugin or service.' ),
			translate( 'Mind telling us which one(s)?' )
		);

		appendRadioOption(
			'leavingWP',
			translate( "I'm moving my site off of WordPress." ),
			translate( 'Any particular reason(s)?' )
		);

		appendRadioOption( 'anotherReasonTwo', translate( 'Another reason…' ), ' ' );

		return (
			<div>
				<FormLegend>{ translate( 'Where is your next adventure taking you?' ) }</FormLegend>
				{ questionTwoOrder.map( question => reasons[ question ] ) }
			</div>
		);
	};

	renderFreeformQuestion = () => {
		const { translate } = this.props;
		return (
			<FormFieldset>
				<FormLabel>
					{ translate( "What's one thing we could have done better? (optional)" ) }
					<FormTextarea
						name="improvementInput"
						id="improvementInput"
						value={ this.state.questionThreeText }
						onChange={ this.onTextThreeChange }
					/>
				</FormLabel>
			</FormFieldset>
		);
	};

	recordClickConciergeEvent = () =>
		this.props.recordTracksEvent( 'calypso_purchases_cancel_form_concierge_click' );

	openConcierge = () => {
		if ( ! this.props.selectedSite ) {
			return;
		}
		this.recordClickConciergeEvent();

		return window.open( `/me/concierge/${ this.props.selectedSite.slug }/book` );
	};

	renderConciergeOffer = () => {
		const { selectedSite, translate } = this.props;
		return (
			selectedSite && (
				<FormFieldset>
					<p>
						{ translate(
							'Schedule a 30 minute orientation with one of our Happiness Engineers. ' +
								"We'll help you to set up your site and answer any questions you have!"
						) }
					</p>
					<Button onClick={ this.openConcierge } primary>
						{ translate( 'Schedule a session' ) }
					</Button>
				</FormFieldset>
			)
		);
	};

	onChatInitiated = () => {
		this.recordEvent( 'calypso_purchases_cancel_form_chat_initiated' );
		this.closeDialog();
	};

	renderLiveChat = () => {
		const { purchase, translate } = this.props;
		const productName = getName( purchase );
		return (
			<FormFieldset>
				<p>
					{ translate(
						'As a %(productName)s user, you have instant access to our team of Happiness ' +
							'Engineers who can answer your questions and get your site up and running ' +
							'just as you like! Click the button below to start a chat now.',
						{
							args: { productName },
						}
					) }
				</p>
				<HappychatButton primary borderless={ false } onClick={ this.onChatInitiated }>
					{ translate( 'Start a Live chat' ) }
				</HappychatButton>
			</FormFieldset>
		);
	};

	surveyContent() {
		const { translate, showSurvey } = this.props;
		const { surveyStep } = this.state;

		if ( showSurvey ) {
			if ( surveyStep === steps.INITIAL_STEP ) {
				return (
					<div>
						<FormSectionHeading>{ translate( 'Your thoughts are needed.' ) }</FormSectionHeading>
						<p>
							{ translate(
								'Before you go, please answer a few quick questions to help us improve WordPress.com.'
							) }
						</p>
						{ this.renderQuestionOne() }
						{ this.renderQuestionTwo() }
					</div>
				);
			}

			if ( surveyStep === steps.CONCIERGE_STEP ) {
				return (
					<div>
						<FormSectionHeading>
							{ translate( 'Let us help you set up your site!' ) }
						</FormSectionHeading>
						{ this.renderConciergeOffer() }
					</div>
				);
			}

			if ( surveyStep === steps.HAPPYCHAT_STEP ) {
				return (
					<div>
						<FormSectionHeading>{ translate( 'How can we help?' ) }</FormSectionHeading>
						{ this.renderLiveChat() }
					</div>
				);
			}

			if ( surveyStep === steps.BUSINESS_AT_STEP ) {
				return <BusinessATStep />;
			}

			if ( surveyStep === steps.UPGRADE_AT_STEP ) {
				return <UpgradeATStep />;
			}

			return (
				<div>
					<FormSectionHeading>
						{ translate( 'One more question before you go.' ) }
					</FormSectionHeading>
					{ this.renderFreeformQuestion() }
					{ this.props.defaultContent }
				</div>
			);
		}

		// just return the default if we don't want to show the survey
		return <div>{ this.props.defaultContent }</div>;
	}

	closeDialog = () => {
		this.props.onClose();
		this.initSurveyState();

		this.recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	changeSurveyStep = stepFunction => {
		const allSteps = this.getAllSurveySteps();
		const newStep = stepFunction( this.state.surveyStep, allSteps );

		this.setState( { surveyStep: newStep } );

		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
	};

	clickNext = () => {
		if ( this.state.isRemoving || ! isSurveyFilledIn( this.state ) ) {
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

	getStepButtons = () => {
		const { flowType, translate, disableButtons, purchase } = this.props;
		const { surveyStep } = this.state;
		const disabled = disableButtons || this.state.isSubmitting;

		const close = {
				action: 'close',
				disabled,
				label:
					flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW_SURVEY_ONLY
						? translate( 'Skip' )
						: translate( "I'll Keep It" ),
			},
			chat = (
				<PrecancellationChatButton
					purchase={ purchase }
					onClick={ this.closeDialog }
					surveyStep={ surveyStep }
				/>
			),
			next = {
				action: 'next',
				disabled: disabled || ! isSurveyFilledIn( this.state ),
				label: translate( 'Next Step' ),
				onClick: this.clickNext,
			},
			prev = {
				action: 'prev',
				disabled,
				label: translate( 'Previous Step' ),
				onClick: this.clickPrevious,
			},
			cancel = {
				action: 'cancel',
				disabled,
				label: translate( 'Cancel Now' ),
				onClick: this.onSubmit,
				isPrimary: true,
			},
			remove = {
				action: 'remove',
				disabled,
				label: translate( 'Remove Now' ),
				onClick: this.onSubmit,
				isPrimary: true,
			},
			submit = {
				action: 'submit',
				disabled: this.state.isSubmitting,
				label: translate( 'Submit' ),
				onClick: this.onSubmit,
				isPrimary: true,
			};

		const firstButtons =
			config.isEnabled( 'upgrades/precancellation-chat' ) && surveyStep !== 'happychat_step'
				? [ chat, close ]
				: [ close ];

		if ( surveyStep === steps.FINAL_STEP ) {
			const stepsCount = this.getAllSurveySteps().length;
			const prevButton = stepsCount > 1 ? [ prev ] : [];

			switch ( flowType ) {
				case CANCEL_FLOW_TYPE.REMOVE:
					return firstButtons.concat( [ ...prevButton, remove ] );
				case CANCEL_FLOW_TYPE.CANCEL_AUTORENEW_SURVEY_ONLY:
					return firstButtons.concat( [ ...prevButton, submit ] );
				default:
					return firstButtons.concat( [ ...prevButton, cancel ] );
			}
		}

		return firstButtons.concat(
			this.state.surveyStep === steps.INITIAL_STEP ? [ next ] : [ prev, next ]
		);
	};

	componentDidUpdate( prevProps ) {
		if (
			! prevProps.isVisible &&
			this.props.isVisible &&
			this.state.surveyStep === steps.INITIAL_STEP
		) {
			this.recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}

	componentDidMount() {
		this.initSurveyState();
	}

	render() {
		return (
			<Dialog
				isVisible={ this.props.isVisible }
				onClose={ this.closeDialog }
				buttons={ this.getStepButtons() }
				className="cancel-purchase-form__dialog"
			>
				{ this.surveyContent() }
			</Dialog>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
		precancellationChatAvailable: isPrecancellationChatAvailable( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( CancelPurchaseForm ) );
