/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { shuffle } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import { Dialog, Button } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSiteImportEngine from 'calypso/state/selectors/get-site-import-engine';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isPrecancellationChatAvailable from 'calypso/state/happychat/selectors/is-precancellation-chat-available';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import HappychatButton from 'calypso/components/happychat/button';
import * as steps from './steps';
import initialSurveyState from './initial-survey-state';
import BusinessATStep from './step-components/business-at-step';
import UpgradeATStep from './step-components/upgrade-at-step';
import PrecancellationChatButton from './precancellation-chat-button';
import DowngradeStep from './step-components/downgrade-step';
import { getName, isRefundable } from 'calypso/lib/purchases';
import {
	isGSuiteOrGoogleWorkspace,
	isJetpackPlanSlug,
	isJetpackProductSlug,
	TERM_ANNUALLY,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import { radioTextOption, radioSelectOption } from './radio-option';
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
import { getDowngradePlanRawPrice } from 'calypso/state/purchases/selectors';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { DOWNGRADEABLE_PLANS_FROM_PLAN } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { slugToSelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/utils';

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

	shouldShowChatButton = () => {
		if ( ! config.isEnabled( 'upgrades/precancellation-chat' ) ) {
			return false;
		}

		// Don't show a button to start Happychat
		// if we're already in a chat session
		const { surveyStep } = this.state;
		if ( surveyStep === steps.HAPPYCHAT_STEP ) {
			return false;
		}

		// Jetpack doesn't do Happychat support
		const { purchase } = this.props;
		const isJetpack =
			isJetpackProductSlug( purchase.productSlug ) || isJetpackPlanSlug( purchase.productSlug );

		// NOTE: The HappychatButton component may still decide not to render,
		// based on agent availability and connection status.

		return ! isJetpack;
	};

	getAllSurveySteps = () => {
		const {
			purchase,
			isChatAvailable,
			isChatActive,
			precancellationChatAvailable,
			downgradeClick,
		} = this.props;
		const downgradePossible = !! downgradeClick;

		return stepsForProductAndSurvey(
			this.state,
			purchase,
			isChatAvailable || isChatActive,
			precancellationChatAvailable,
			downgradePossible
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
			importQuestionText: '',

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

	onRadioOneChange = ( event ) => {
		this.recordClickRadioEvent( 'radio_1', event.currentTarget.value );

		const newState = {
			...this.state,
			questionOneRadio: event.currentTarget.value,
			questionOneText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextOneChange = ( event ) => {
		const newState = {
			...this.state,
			questionOneText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onSelectOneChange = ( option ) => {
		const newState = {
			...this.state,
			questionOneText: option.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onRadioTwoChange = ( event ) => {
		this.recordClickRadioEvent( 'radio_2', event.currentTarget.value );

		const newState = {
			...this.state,
			questionTwoRadio: event.currentTarget.value,
			questionTwoText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextTwoChange = ( event ) => {
		const newState = {
			...this.state,
			questionTwoText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onTextThreeChange = ( event ) => {
		const newState = {
			...this.state,
			questionThreeText: event.currentTarget.value,
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onImportRadioChange = ( event ) => {
		this.recordClickRadioEvent( 'import_radio', event.currentTarget.value );

		const newState = {
			...this.state,
			importQuestionRadio: event.currentTarget.value,
			importQuestionText: '',
		};
		this.setState( newState );
		this.props.onInputChange( newState );
	};

	onImportTextChange = ( event ) => {
		const newState = {
			...this.state,
			importQuestionText: event.currentTarget.value,
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
			default:
				// Although we shouldn't allow it to reach here, we still include this default in case we forgot to add proper mappings.
				return 'general';
		}
	};

	onSubmit = () => {
		const { purchase } = this.props;

		if ( ! isGSuiteOrGoogleWorkspace( purchase ) ) {
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
				'import-satisfaction': { response: this.state.importQuestionRadio },
				type: this.getSurveyDataType(),
			};

			submitSurvey(
				'calypso-remove-purchase',
				purchase.siteId,
				enrichedSurveyData( surveyData, purchase )
			).then( () => {
				this.setState( {
					isSubmitting: false,
				} );
			} );
		}

		this.props.onClickFinalConfirm();

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	downgradeClick = () => {
		if ( ! this.state.isSubmitting ) {
			this.props.downgradeClick();
			this.recordEvent( 'calypso_purchases_downgrade_form_submit' );
			this.setState( {
				isSubmitting: true,
			} );
		}
	};

	renderQuestionOne = () => {
		const reasons = {};
		const { translate } = this.props;
		const { questionOneOrder, questionOneRadio, questionOneText } = this.state;
		const { productSlug: productBeingRemoved } = this.props.purchase;

		// get all downgradable plans and products for downgrade question dropdown
		const downgradablePlans = DOWNGRADEABLE_PLANS_FROM_PLAN[ productBeingRemoved ];
		const downgradableJetpackPlansAndProducts = [
			...( downgradablePlans ? downgradablePlans : [] ),
			...JETPACK_PRODUCTS_LIST,
		];
		const selectBoxItems = downgradableJetpackPlansAndProducts
			.map( slugToSelectorProduct )
			// filter out any null items
			.filter( ( product ) => product )
			// get only annual products/plans (no need for monthly variants in the dropdown)
			.filter( ( product ) => product.term === TERM_ANNUALLY )
			.map( ( product ) => ( {
				value: product.productSlug,
				label: translate( 'Jetpack {{planName/}}', {
					components: { planName: <>{ product.shortName }</> },
				} ),
			} ) );

		const dropDownSelectOptions = [
			{ value: 'select_a_product', label: translate( 'Select a product' ), isLabel: true },
			...selectBoxItems,
		];

		const initialSelected = downgradableJetpackPlansAndProducts.includes(
			this.state.questionOneText
		)
			? this.state.questionOneText
			: 'select_a_product';

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			( reasons[ key ] = radioTextOption(
				key,
				questionOneRadio,
				questionOneText,
				this.onRadioOneChange,
				this.onTextOneChange,
				radioPrompt,
				textPlaceholder
			) );

		const appendRadioOptionWithSelect = (
			key,
			radioPrompt,
			selectLabel,
			selectOptions,
			selected
		) =>
			( reasons[ key ] = radioSelectOption(
				key,
				questionOneRadio,
				this.onRadioOneChange,
				this.onSelectOneChange,
				radioPrompt,
				selectLabel,
				selectOptions,
				selected
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

		appendRadioOptionWithSelect(
			'downgradeToAnotherPlan',
			translate( "I'd like to downgrade to another plan." ),
			translate( 'Mind telling us which one?' ),
			dropDownSelectOptions,
			initialSelected
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
			<div className="cancel-purchase-form__question">
				<FormLegend>{ translate( 'Please tell us why you are canceling:' ) }</FormLegend>
				{ questionOneOrder.map( ( question ) => reasons[ question ] ) }
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
			( reasons[ key ] = radioTextOption(
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
			<div className="cancel-purchase-form__question">
				<FormLegend>{ translate( 'Where is your next adventure taking you?' ) }</FormLegend>
				{ questionTwoOrder.map( ( question ) => reasons[ question ] ) }
			</div>
		);
	};

	renderImportQuestion = () => {
		const reasons = [];
		const { translate } = this.props;
		const { importQuestionRadio, importQuestionText } = this.state;

		const appendRadioOption = ( key, radioPrompt, textPlaceholder ) =>
			reasons.push(
				radioTextOption(
					key,
					importQuestionRadio,
					importQuestionText,
					this.onImportRadioChange,
					this.onImportTextChange,
					radioPrompt,
					textPlaceholder
				)
			);

		appendRadioOption( 'happy', translate( 'I was happy.' ) );

		appendRadioOption(
			'look',
			translate(
				'Most of my content was imported, but it was too hard to get things looking right.'
			)
		);

		appendRadioOption( 'content', translate( 'Not enough of my content was imported.' ) );

		appendRadioOption(
			'functionality',
			translate( "I didn't have the functionality I have on my existing site." )
		);

		return (
			<div className="cancel-purchase-form__question">
				<FormLegend>
					{ translate( 'You imported from another site. How did the import go?' ) }
				</FormLegend>
				{ reasons }
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

	getRefundAmount = () => {
		const { purchase } = this.props;
		const { refundOptions, currencyCode } = purchase;
		const { precision } = getCurrencyDefaults( currencyCode );
		const refundAmount =
			isRefundable( purchase ) && refundOptions[ 0 ] && refundOptions[ 0 ].refund_amount
				? refundOptions[ 0 ].refund_amount
				: 0;

		return parseFloat( refundAmount ).toFixed( precision );
	};

	surveyContent() {
		const { translate, isImport, showSurvey, purchase } = this.props;
		const { surveyStep } = this.state;
		const isJetpack =
			isJetpackProductSlug( purchase.productSlug ) || isJetpackPlanSlug( purchase.productSlug );
		const productName = isJetpack ? translate( 'Jetpack' ) : translate( 'WordPress.com' );

		if ( showSurvey ) {
			if ( surveyStep === steps.INITIAL_STEP ) {
				return (
					<div>
						<FormSectionHeading>{ translate( 'Your thoughts are needed.' ) }</FormSectionHeading>
						<p>
							{ translate(
								'Before you go, please answer a few quick questions to help us improve %(productName)s.',
								{
									args: { productName },
								}
							) }
						</p>
						{ this.renderQuestionOne() }
						{ isImport && this.renderImportQuestion() }
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

			if ( surveyStep === steps.DOWNGRADE_STEP ) {
				const { precision } = getCurrencyDefaults( purchase.currencyCode );
				const planCost = parseFloat( this.props.downgradePlanPrice ).toFixed( precision );
				return (
					<DowngradeStep
						currencySymbol={ purchase.currencySymbol }
						planCost={ planCost }
						refundAmount={ this.getRefundAmount() }
					/>
				);
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

	changeSurveyStep = ( stepFunction ) => {
		const allSteps = this.getAllSurveySteps();
		const newStep = stepFunction( this.state.surveyStep, allSteps );

		this.setState( { surveyStep: newStep } );

		this.recordEvent( 'calypso_purchases_cancel_survey_step', { new_step: newStep } );
	};

	clickNext = () => {
		const { isImport } = this.props;
		if ( this.state.isRemoving || ! isSurveyFilledIn( this.state, isImport ) ) {
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
		const { flowType, translate, disableButtons, purchase, isImport } = this.props;
		const { surveyStep } = this.state;
		const disabled = disableButtons || this.state.isSubmitting;

		const close = {
			action: 'close',
			disabled,
			label: translate( "I'll Keep It" ),
		};
		const chat = (
			<PrecancellationChatButton
				purchase={ purchase }
				onClick={ this.closeDialog }
				surveyStep={ surveyStep }
			/>
		);
		const next = {
			action: 'next',
			disabled: disabled || ! isSurveyFilledIn( this.state, isImport ),
			label: translate( 'Next Step' ),
			onClick: this.clickNext,
		};
		const prev = {
			action: 'prev',
			disabled,
			label: translate( 'Previous Step' ),
			onClick: this.clickPrevious,
		};
		const cancel = {
			action: 'cancel',
			disabled,
			label: translate( 'Cancel Now' ),
			onClick: this.onSubmit,
			isPrimary: true,
		};
		const downgrade = {
			action: 'downgrade',
			disabled: this.state.isSubmitting,
			label: translate( 'Switch to Personal' ),
			onClick: this.downgradeClick,
			isPrimary: true,
		};
		const removeText = translate( 'Remove It' );
		const removingText = translate( 'Removing' );
		const remove = (
			<Button
				disabled={ this.props.disableButtons }
				busy={ this.props.disableButtons }
				onClick={ this.onSubmit }
				primary
				data-e2e-button="remove"
			>
				{ this.props.disableButtons ? removingText : removeText }
			</Button>
		);

		const firstButtons = [ close ];
		if ( this.shouldShowChatButton() ) {
			firstButtons.unshift( chat );
		}

		if ( surveyStep === steps.FINAL_STEP ) {
			const stepsCount = this.getAllSurveySteps().length;
			const prevButton = stepsCount > 1 ? [ prev ] : [];

			switch ( flowType ) {
				case CANCEL_FLOW_TYPE.REMOVE:
					return firstButtons.concat( [ ...prevButton, remove ] );
				default:
					return firstButtons.concat( [ ...prevButton, cancel ] );
			}
		}

		if ( this.state.surveyStep === steps.DOWNGRADE_STEP ) {
			return firstButtons.concat( [ prev, downgrade, next ] );
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
		const { selectedSite } = this.props;
		return (
			<Dialog
				isVisible={ this.props.isVisible }
				onClose={ this.closeDialog }
				buttons={ this.getStepButtons() }
				className="cancel-purchase-form__dialog"
			>
				{ this.surveyContent() }
				<QueryPlans />
				{ selectedSite && <QuerySitePlans siteId={ selectedSite.ID } /> }
			</Dialog>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
		isImport: !! getSiteImportEngine( state, purchase.siteId ),
		precancellationChatAvailable: isPrecancellationChatAvailable( state ),
		downgradePlanPrice: getDowngradePlanRawPrice( state, purchase ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( CancelPurchaseForm ) );
