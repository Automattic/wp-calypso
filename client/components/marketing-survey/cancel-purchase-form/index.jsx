import {
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isWpComMonthlyPlan,
	isWpComBusinessPlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	planMatches,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	GROUP_WPCOM,
} from '@automattic/calypso-products';
import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products/src';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { SUPPORT_HAPPYCHAT } from '@automattic/help-center';
import {
	Button as GutenbergButton,
	CheckboxControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';
import { Component, cloneElement } from 'react';
import { connect } from 'react-redux';
import rocketImage from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import pluginsThemesImage from 'calypso/assets/images/customer-home/illustration--task-connect-social-accounts.svg';
import downgradeImage from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { isRefundable } from 'calypso/lib/purchases';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import {
	getDowngradePlanRawPrice,
	willAtomicSiteRevertAfterPurchaseDeactivation,
} from 'calypso/state/purchases/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import getSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import getSiteImportEngine from 'calypso/state/selectors/get-site-import-engine';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSite from 'calypso/state/sites/selectors/get-site';
import { getCancellationReasons } from './cancellation-reasons';
import { CANCEL_FLOW_TYPE } from './constants';
import enrichedSurveyData from './enriched-survey-data';
import initialSurveyState from './initial-survey-state';
import isSurveyFilledIn from './is-survey-filled-in';
import nextStep from './next-step';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './options-for-product';
import PrecancellationChatButton from './precancellation-chat-button';
import BusinessATStep from './step-components/business-at-step';
import DowngradeStep from './step-components/downgrade-step';
import FreeMonthOfferStep from './step-components/free-month-offer-step';
import UpgradeATStep from './step-components/upgrade-at-step';
import { ATOMIC_REVERT_STEP, FEEDBACK_STEP } from './steps';

import './style.scss';

class CancelPurchaseForm extends Component {
	static propTypes = {
		disableButtons: PropTypes.bool,
		purchase: PropTypes.object.isRequired,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func.isRequired,
		onClickFinalConfirm: PropTypes.func.isRequired,
		flowType: PropTypes.string.isRequired,
		translate: PropTypes.func,
		cancelBundledDomain: PropTypes.bool,
		includedDomainPurchase: PropTypes.object,
		linkedPurchases: PropTypes.array,
	};

	static defaultProps = {
		isVisible: false,
	};

	getAllSurveySteps() {
		if ( this.props.willAtomicSiteRevert ) {
			return [ FEEDBACK_STEP, ATOMIC_REVERT_STEP ];
		}

		return [ FEEDBACK_STEP ];
	}

	initSurveyState() {
		const [ firstStep ] = this.getAllSurveySteps();

		this.setState( {
			surveyStep: firstStep,
			...initialSurveyState(),
			upsell: '',
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
			questionOneOrder,
			questionTwoText: '',
			questionTwoOrder,
			questionThreeText: '',
			isSubmitting: false,
			upsell: '',
			atomicRevertCheckOne: false,
			atomicRevertCheckTwo: false,
			purchaseIsAlreadyExtended: false,
		};
	}

	/**
	 * Get a related upsell nudge for the chosen reason.
	 *
	 * @param {string} reason Selected cancellation reason
	 * @returns {string} Upsell type
	 */
	getUpsellType( reason ) {
		const { purchase, downgradeClick, freeMonthOfferClick } = this.props;
		const productSlug = purchase?.productSlug || '';

		if ( ! productSlug ) {
			return '';
		}

		const canRefund = !! parseFloat( this.getRefundAmount() );

		if (
			[ 'cannotUsePlugin', 'cannotUseTheme' ].includes( reason ) &&
			isWpComBusinessPlan( productSlug )
		) {
			return 'business-atomic';
		}

		if (
			[ 'cannotUsePlugin', 'cannotUseTheme' ].includes( reason ) &&
			( isWpComPremiumPlan( productSlug ) || isWpComPersonalPlan( productSlug ) )
		) {
			return 'upgrade-atomic';
		}

		if ( [ 'tooExpensive', 'wantCheaperPlan' ].includes( reason ) && !! downgradeClick ) {
			if ( isWpComPremiumPlan( productSlug ) ) {
				return 'downgrade-personal';
			}

			if (
				canRefund &&
				( planMatches( productSlug, { term: TERM_ANNUALLY, group: GROUP_WPCOM } ) ||
					planMatches( productSlug, { term: TERM_BIENNIALLY, group: GROUP_WPCOM } ) )
			) {
				return 'downgrade-monthly';
			}
		}

		if (
			[ 'noTime', 'siteIsNotReady' ].includes( reason ) &&
			isWpComMonthlyPlan( productSlug ) &&
			!! freeMonthOfferClick &&
			! this.state.purchaseIsAlreadyExtended
		) {
			return 'free-month-offer';
		}

		return '';
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

	onRadioOneChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		this.recordClickRadioEvent( 'radio_1', value );

		const newState = {
			...this.state,
			questionOneRadio: value,
			questionOneText: '',
			upsell: '',
		};
		this.setState( newState );
	};

	onTextOneChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		const newState = {
			...this.state,
			questionOneText: value,
		};
		this.setState( newState );
	};

	onSelectOneChange = ( optionOrValue ) => {
		const value = optionOrValue?.value ?? optionOrValue;
		const newState = {
			...this.state,
			questionOneText: value,
			upsell: this.getUpsellType( value ) || '',
		};
		this.setState( newState );
	};

	onRadioTwoChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		this.recordClickRadioEvent( 'radio_2', value );

		const newState = {
			...this.state,
			questionTwoRadio: value,
			questionTwoText: '',
		};
		this.setState( newState );
	};

	onTextTwoChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		const newState = {
			...this.state,
			questionTwoText: value,
		};
		this.setState( newState );
	};

	onTextThreeChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		const newState = {
			...this.state,
			questionThreeText: value,
		};
		this.setState( newState );
	};

	onImportRadioChange = ( eventOrValue ) => {
		const value = eventOrValue?.currentTarget?.value ?? eventOrValue;
		this.recordClickRadioEvent( 'import_radio', value );

		const newState = {
			...this.state,
			importQuestionRadio: value,
		};
		this.setState( newState );
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

			this.props
				.submitSurvey(
					'calypso-remove-purchase',
					purchase.siteId,
					enrichedSurveyData( surveyData, purchase )
				)
				.then( () => {
					this.setState( {
						isSubmitting: false,
					} );
				} );
		}

		this.props.onClickFinalConfirm();

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	downgradeClick = ( upsell ) => {
		if ( ! this.state.isSubmitting ) {
			this.props.downgradeClick( upsell );
			this.recordEvent( 'calypso_purchases_downgrade_form_submit' );
			this.setState( {
				isSubmitting: true,
			} );
		}
	};

	freeMonthOfferClick = () => {
		if ( ! this.state.isSubmitting ) {
			this.props.freeMonthOfferClick();
			this.recordEvent( 'calypso_purchases_free_month_offer_form_submit' );
			this.setState( {
				isSubmitting: true,
			} );
		}
	};

	showUpsell = () => {
		const { isSubmitting, upsell } = this.state;

		if ( ! upsell ) {
			return null;
		}

		const {
			downgradePlanPrice,
			purchase,
			site,
			translate,
			includedDomainPurchase,
			cancelBundledDomain,
		} = this.props;

		const dismissUpsell = () => this.setState( { upsell: '' } );

		const Upsell = ( { actionHref, actionText, actionOnClick, children, image } ) => (
			<div className="cancel-purchase-form__upsell">
				<img className="cancel-purchase-form__upsell-image" src={ image } alt="" />
				<div className="cancel-purchase-form__upsell-description">
					{ children }
					<GutenbergButton
						href={ actionHref }
						isPrimary
						onClick={ actionOnClick }
						disabled={ isSubmitting }
					>
						{ actionText }
					</GutenbergButton>
					<GutenbergButton onClick={ dismissUpsell }>{ translate( 'Dismiss' ) }</GutenbergButton>
				</div>
			</div>
		);

		switch ( upsell ) {
			case 'business-atomic':
				return (
					<Upsell
						actionOnClick={ this.closeDialog }
						actionText={ translate( 'Keep my plan' ) }
						image={ pluginsThemesImage }
					>
						<BusinessATStep />
					</Upsell>
				);
			case 'upgrade-atomic':
				return (
					<Upsell
						actionHref={ `/checkout/${ site.slug }/business?coupon=BIZC25` }
						actionOnClick={ () =>
							this.props.recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' )
						}
						actionText={ translate( 'Upgrade my site' ) }
						image={ pluginsThemesImage }
					>
						<UpgradeATStep selectedSite={ site } />
					</Upsell>
				);
			case 'downgrade-personal':
			case 'downgrade-monthly':
				//test
				// eslint-disable-next-line no-case-declarations
				const { precision } = getCurrencyDefaults( purchase.currencyCode );
				// eslint-disable-next-line no-case-declarations
				const planCost = parseFloat( downgradePlanPrice ).toFixed( precision );

				return (
					<Upsell
						actionOnClick={ () => this.downgradeClick( upsell ) }
						actionText={
							upsell === 'downgrade-monthly'
								? translate( 'Switch to a monthly subscription' )
								: translate( 'Switch to Personal' )
						}
						image={ downgradeImage }
					>
						<DowngradeStep
							currencySymbol={ purchase.currencySymbol }
							planCost={ planCost }
							refundAmount={ this.getRefundAmount() }
							upsell={ upsell }
							cancelBundledDomain={ cancelBundledDomain }
							includedDomainPurchase={ includedDomainPurchase }
						/>
					</Upsell>
				);
			case 'free-month-offer':
				return (
					<Upsell
						actionOnClick={ this.freeMonthOfferClick }
						actionText={ translate( 'Get a free month' ) }
						image={ rocketImage }
					>
						<FreeMonthOfferStep productSlug={ purchase.productSlug } />
					</Upsell>
				);
			default:
				return null;
		}
	};

	renderQuestionOne = () => {
		const { translate } = this.props;
		const { questionOneOrder, questionOneRadio, questionOneText } = this.state;
		const { productSlug } = this.props.purchase; // Product being cancelled
		const reasons = getCancellationReasons( questionOneOrder, { productSlug } );
		const selectedOption = reasons.find( ( { value } ) => value === questionOneRadio );

		return (
			<div className="cancel-purchase-form__feedback-question">
				<SelectControl
					label={ translate( 'Why are you canceling?' ) }
					value={ questionOneRadio }
					options={ reasons }
					onChange={ this.onRadioOneChange }
				/>
				{ selectedOption?.textPlaceholder && (
					<TextControl
						placeholder={ selectedOption.textPlaceholder }
						value={ questionOneText }
						onChange={ this.onTextOneChange }
					/>
				) }
				{ selectedOption?.selectOptions && ! selectedOption?.textPlaceholder && (
					<SelectControl
						label={ selectedOption.selectLabel }
						value={ questionOneText || selectedOption.selectInitialValue || '' }
						options={ selectedOption.selectOptions }
						onChange={ this.onSelectOneChange }
					/>
				) }
				{ this.showUpsell() }
			</div>
		);
	};

	renderQuestionTwo = () => {
		const { translate } = this.props;
		const { questionTwoOrder, questionTwoRadio, questionTwoText } = this.state;

		if ( questionTwoOrder.length === 0 ) {
			return null;
		}

		const options = [
			{
				value: 'stayingHere',
				label: translate( "I'm staying here and using the free plan." ),
			},
			{
				value: 'otherWordPress',
				label: translate( "I'm going to use WordPress somewhere else." ),
				textPlaceholder: translate( 'Mind telling us where?' ),
			},
			{
				value: 'differentService',
				label: translate( "I'm going to use a different service for my website or blog." ),
				textPlaceholder: translate( 'Mind telling us which one?' ),
			},
			{
				value: 'noNeed',
				label: translate( 'I no longer need a website or blog.' ),
				textPlaceholder: translate( 'What will you do instead?' ),
			},
			{
				value: 'otherPlugin',
				label: translate( 'I found a better plugin or service.' ),
				textPlaceholder: translate( 'Mind telling us which one(s)?' ),
			},
			{
				value: 'leavingWP',
				label: translate( "I'm moving my site off of WordPress." ),
				textPlaceholder: translate( 'Any particular reason(s)?' ),
			},
			{
				value: 'anotherReasonTwo',
				label: translate( 'Another reason…' ),
				textPlaceholder: translate( 'Can you please specify?' ),
			},
			{
				value: '',
				label: translate( 'Select an answer' ),
			},
		];

		const optionKeys = [ ...questionTwoOrder ];
		optionKeys.unshift( '' ); // Placeholder.

		const selectedOption = options.find( ( option ) => option.value === questionTwoRadio );

		return (
			<div className="cancel-purchase-form__feedback-question">
				<SelectControl
					label={ translate( 'Where is your next adventure taking you?' ) }
					value={ questionTwoRadio }
					options={ optionKeys.map( ( key ) => {
						const option = options.find( ( { value } ) => value === key );
						return {
							label: option.label,
							value: option.value,
							disabled: ! option.value,
						};
					} ) }
					onChange={ this.onRadioTwoChange }
				/>
				{ selectedOption?.textPlaceholder && (
					<TextControl
						placeholder={ selectedOption.textPlaceholder }
						value={ questionTwoText }
						onChange={ this.onTextTwoChange }
					/>
				) }
			</div>
		);
	};

	renderImportQuestion = () => {
		const { translate } = this.props;
		const { importQuestionRadio } = this.state;

		const options = [
			{
				value: 'happy',
				label: translate( 'I was happy.' ),
			},
			{
				value: 'look',
				label: translate(
					'Most of my content was imported, but it was too hard to get things looking right.'
				),
			},
			{
				value: 'content',
				label: translate( 'Not enough of my content was imported.' ),
			},
			{
				value: 'functionality',
				label: translate( "I didn't have the functionality I have on my existing site." ),
			},
		];

		// Add placeholder.
		options.unshift( {
			value: '',
			label: translate( 'Select an answer' ),
		} );

		return (
			<div className="cancel-purchase-form__feedback-question">
				<SelectControl
					label={ translate( 'You imported from another site. How did the import go?' ) }
					value={ importQuestionRadio }
					options={ options.map( ( { label, value } ) => ( {
						label,
						value,
						disabled: ! value,
					} ) ) }
					onChange={ this.onImportRadioChange }
				/>
			</div>
		);
	};

	renderFreeformQuestion = () => {
		const { translate, isImport, purchase } = this.props;

		if ( ! isSurveyFilledIn( this.state, isImport, isPlan( purchase ) ) ) {
			// Do not display this question unless user has already answered previous questions.
			return null;
		}

		return (
			<div className="cancel-purchase-form__feedback-question">
				<TextareaControl
					label={ translate( "What's one thing we could have done better?" ) }
					value={ this.state.questionThreeText }
					onChange={ this.onTextThreeChange }
					placeholder={ translate( 'Optional' ) }
					name="improvementInput"
					id="improvementInput"
				/>
			</div>
		);
	};

	getRefundAmount = () => {
		const { purchase } = this.props;
		const { refundOptions, currencyCode } = purchase;
		const { precision } = getCurrencyDefaults( currencyCode );
		const refundAmount =
			isRefundable( purchase ) && refundOptions?.[ 0 ]?.refund_amount
				? refundOptions[ 0 ].refund_amount
				: 0;

		return parseFloat( refundAmount ).toFixed( precision );
	};

	surveyContent() {
		const { atomicTransfer, translate, isImport, moment, purchase, site, hasBackupsFeature } =
			this.props;
		const { atomicRevertCheckOne, atomicRevertCheckTwo, surveyStep } = this.state;
		const productName = translate( 'WordPress.com' );

		if ( surveyStep === FEEDBACK_STEP ) {
			return (
				<div className="cancel-purchase-form__feedback">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Share your feedback' ) }
						subHeaderText={ translate(
							'Before you go, please answer a few quick questions to help us improve %(productName)s.',
							{
								args: { productName },
							}
						) }
					/>
					<div className="cancel-purchase-form__feedback-questions">
						{ isPlan( purchase ) && (
							<>
								{ this.renderQuestionOne() }
								{ isImport && this.renderImportQuestion() }
								{ this.renderQuestionTwo() }
							</>
						) }
						{ this.renderFreeformQuestion() }
					</div>
				</div>
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			const atomicTransferDate = moment( atomicTransfer.created_at ).format( 'LL' );
			let subHeaderText;
			if ( isPlan( purchase ) ) {
				subHeaderText = translate(
					'If you deactivate your plan, we will set your site to private and revert it to the point when you installed your first plugin or custom theme, or activated hosting features ' +
						'on {{strong}}%(atomicTransferDate)s{{/strong}}. All of your posts, pages, and media will be preserved, except for content generated by plugins or custom themes. {{moreInfoTooltip/}}',
					{
						args: { atomicTransferDate },
						components: {
							moreInfoTooltip: (
								<InfoPopover className="cancel-purchase-form__atomic-revert-more-info">
									{ translate(
										'On %(atomicTransferDate)s, we automatically moved your site to a platform that supports the usage of plugins, custom themes, and hosting features. ' +
											'If you deactivate your plan, we will move your site back to its original platform.',
										{ args: { atomicTransferDate } }
									) }
								</InfoPopover>
							),
							// eslint-disable-next-line wpcalypso/jsx-classname-namespace
							strong: <strong className="is-highlighted" />,
						},
					}
				);
			} else {
				subHeaderText = translate(
					'If you deactivate your product, we will set your site to private and revert it to the point when you installed your first plugin or custom theme, or activated hosting features ' +
						'on {{strong}}%(atomicTransferDate)s{{/strong}}. All of your posts, pages, and media will be preserved, except for content generated by plugins or custom themes. {{moreInfoTooltip/}}',
					{
						args: { atomicTransferDate },
						components: {
							moreInfoTooltip: (
								<InfoPopover className="cancel-purchase-form__atomic-revert-more-info">
									{ translate(
										'On %(atomicTransferDate)s, we automatically moved your site to a platform that supports the usage of plugins, custom themes, and hosting features. ' +
											'If you deactivate your product, we will move your site back to its original platform.',
										{ args: { atomicTransferDate } }
									) }
								</InfoPopover>
							),
							// eslint-disable-next-line wpcalypso/jsx-classname-namespace
							strong: <strong className="is-highlighted" />,
						},
					}
				);
			}
			return (
				<div className="cancel-purchase-form__atomic-revert">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Proceed With Caution' ) }
						subHeaderText={ subHeaderText }
					/>
					<p>
						{ translate(
							'Please {{strong}}confirm and check{{/strong}} the following items before you continue with plan deactivation:',
							{ components: { strong: <strong /> } }
						) }
					</p>
					<CheckboxControl
						label={ translate(
							'Any themes/plugins you have installed on the site will be removed, along with their data.'
						) }
						checked={ atomicRevertCheckOne }
						onChange={ ( isChecked ) => this.setState( { atomicRevertCheckOne: isChecked } ) }
					/>
					<CheckboxControl
						label={ translate(
							'Your site will return to its original settings and theme right before the first plugin or custom theme was installed.'
						) }
						checked={ atomicRevertCheckTwo }
						onChange={ ( isChecked ) => this.setState( { atomicRevertCheckTwo: isChecked } ) }
					/>
					{ hasBackupsFeature && (
						<div className="cancel-purchase-form__backups">
							<h4>{ translate( 'Would you like to download the backup of your site?' ) }</h4>
							<p>
								{ translate(
									"To make sure you have everything after your plan is deactivated or if you'd like to migrate, you can download a backup."
								) }
							</p>
							<ExternalLink icon href={ `/backup/${ site.slug }` }>
								{ translate( 'Go to your backups' ) }
							</ExternalLink>
						</div>
					) }
				</div>
			);
		}
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
		this.changeSurveyStep( nextStep );
	};

	getStepButtons = () => {
		const { flowType, translate, disableButtons, isImport, purchase } = this.props;
		const { atomicRevertCheckOne, atomicRevertCheckTwo, isSubmitting, surveyStep } = this.state;
		const isCancelling = disableButtons || isSubmitting;

		const allSteps = this.getAllSurveySteps();
		const isLastStep = surveyStep === allSteps[ allSteps.length - 1 ];
		const buttons = [];

		let canGoNext = ! isCancelling;
		if ( surveyStep === FEEDBACK_STEP ) {
			canGoNext = isSurveyFilledIn( this.state, isImport, isPlan( purchase ) );
		} else if ( surveyStep === ATOMIC_REVERT_STEP ) {
			canGoNext = atomicRevertCheckOne && atomicRevertCheckTwo;
		}

		let closeText = translate( 'Keep my product' );
		if ( isPlan( purchase ) ) {
			closeText = translate( 'Keep my plan' );
		}
		buttons.push(
			<GutenbergButton disabled={ isCancelling } isPrimary onClick={ this.closeDialog }>
				{ closeText }
			</GutenbergButton>
		);

		if ( ! isLastStep ) {
			buttons.push(
				<GutenbergButton disabled={ ! canGoNext } isDefault onClick={ this.clickNext }>
					{ translate( 'Next' ) }
				</GutenbergButton>
			);
		}

		if ( isLastStep ) {
			let actionText;
			const isRemoveFlow = flowType === CANCEL_FLOW_TYPE.REMOVE;
			if ( isCancelling ) {
				actionText = isRemoveFlow ? translate( 'Removing…' ) : translate( 'Cancelling…' );
			} else if ( isPlan( purchase ) ) {
				actionText = isRemoveFlow ? translate( 'Remove plan' ) : translate( 'Cancel plan' );
			} else {
				actionText = isRemoveFlow ? translate( 'Remove product' ) : translate( 'Cancel product' );
			}
			buttons.push(
				<GutenbergButton
					isDefault
					isBusy={ isCancelling }
					disabled={ ! canGoNext }
					onClick={ this.onSubmit }
				>
					{ actionText }
				</GutenbergButton>
			);
		}

		return buttons;
	};

	fetchPurchaseExtendedStatus = async ( purchaseId ) => {
		const newState = {
			...this.state,
		};

		try {
			const res = await wpcom.req.get( {
				path: `/purchases/${ purchaseId }/has-extended`,
				apiNamespace: 'wpcom/v2',
			} );

			newState.purchaseIsAlreadyExtended = res.has_extended;
		} catch {
			// When the request fails, set the flag to true so the extra options don't show up to users.
			newState.purchaseIsAlreadyExtended = true;
		}

		if ( newState.purchaseIsAlreadyExtended && newState.upsell === 'free-month-offer' ) {
			newState.upsell = '';
		}

		this.setState( newState );
	};

	componentDidUpdate( prevProps ) {
		if (
			! prevProps.isVisible &&
			this.props.isVisible &&
			this.state.surveyStep === this.getAllSurveySteps()[ 0 ]
		) {
			this.recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}

	componentDidMount() {
		const { purchase } = this.props;

		this.initSurveyState();
		if ( this.props.isAtomicSite && purchase?.siteId ) {
			this.props.fetchAtomicTransfer( purchase.siteId );
		}

		if ( purchase?.id && isWpComMonthlyPlan( purchase?.productSlug ) ) {
			this.fetchPurchaseExtendedStatus( purchase.id );
		}
	}

	getHeaderTitle() {
		const { flowType, purchase, translate } = this.props;

		if ( flowType === CANCEL_FLOW_TYPE.REMOVE ) {
			if ( isPlan( purchase ) ) {
				return translate( 'Remove plan' );
			}
			return translate( 'Remove product' );
		}

		if ( isPlan( purchase ) ) {
			return translate( 'Cancel plan' );
		}
		return translate( 'Cancel product' );
	}

	render() {
		const { surveyStep } = this.state;
		if ( ! surveyStep ) {
			return null;
		}

		const { isChatActive, isChatAvailable, purchase, site, supportVariation, translate } =
			this.props;
		const steps = this.getAllSurveySteps();

		return (
			<>
				<QueryPlans />
				{ site && <QuerySitePlans siteId={ site.ID } /> }
				<QuerySupportTypes />
				{ this.props.isVisible && (
					<BlankCanvas className="cancel-purchase-form">
						<BlankCanvas.Header onBackClick={ this.closeDialog }>
							{ this.getHeaderTitle() }
							<span className="cancel-purchase-form__site-slug">{ site.slug }</span>
							{ steps.length > 1 && (
								<span className="cancel-purchase-form__step">
									{ translate( 'Step %(currentStep)d of %(totalSteps)d', {
										args: {
											currentStep: steps.indexOf( surveyStep ) + 1,
											totalSteps: steps.length,
										},
									} ) }
								</span>
							) }
						</BlankCanvas.Header>
						<BlankCanvas.Content>{ this.surveyContent() }</BlankCanvas.Content>
						<BlankCanvas.Footer>
							<div className="cancel-purchase-form__actions">
								<div className="cancel-purchase-form__buttons">
									{ this.getStepButtons().map( ( button, key ) =>
										cloneElement( button, { key } )
									) }
								</div>
								{ ( isChatAvailable || isChatActive ) && supportVariation === SUPPORT_HAPPYCHAT && (
									<PrecancellationChatButton
										icon="chat_bubble"
										onClick={ this.closeDialog }
										purchase={ purchase }
										surveyStep={ surveyStep }
									/>
								) }
							</div>
						</BlankCanvas.Footer>
					</BlankCanvas>
				) }
			</>
		);
	}
}

export default connect(
	( state, { purchase, linkedPurchases } ) => ( {
		isChatAvailable: isHappychatAvailable( state ),
		isChatActive: hasActiveHappychatSession( state ),
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
		isImport: !! getSiteImportEngine( state, purchase.siteId ),
		downgradePlanPrice: getDowngradePlanRawPrice( state, purchase ),
		supportVariation: getSupportVariation( state ),
		site: getSite( state, purchase.siteId ),
		willAtomicSiteRevert: willAtomicSiteRevertAfterPurchaseDeactivation(
			state,
			purchase.id,
			linkedPurchases
		),
		atomicTransfer: getAtomicTransfer( state, purchase.siteId ),
		hasBackupsFeature: siteHasFeature( state, purchase.siteId, WPCOM_FEATURES_BACKUPS ),
	} ),
	{
		fetchAtomicTransfer,
		recordTracksEvent,
		submitSurvey,
	}
)( localize( withLocalizedMoment( CancelPurchaseForm ) ) );
