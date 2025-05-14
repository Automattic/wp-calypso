import {
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isWpComMonthlyPlan,
	WPCOM_FEATURES_BACKUPS,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { Button as GutenbergButton } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import FormattedHeader from 'calypso/components/formatted-header';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { isAgencyPartnerType, isPartnerPurchase, isRefundable } from 'calypso/lib/purchases';
import { cancelPurchaseSurveyCompleted, submitSurvey } from 'calypso/lib/purchases/actions';
import wpcom from 'calypso/lib/wp';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import {
	willAtomicSiteRevertAfterPurchaseDeactivation,
	getDowngradePlanFromPurchase,
	getDowngradePlanToMonthlyFromPurchase,
} from 'calypso/state/purchases/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import getSiteImportEngine from 'calypso/state/selectors/get-site-import-engine';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSite from 'calypso/state/sites/selectors/get-site';
import { CANCEL_FLOW_TYPE } from './constants';
import enrichedSurveyData from './enriched-survey-data';
import { getUpsellType } from './get-upsell-type';
import initialSurveyState from './initial-survey-state';
import nextStep from './next-step';
import {
	cancellationOptionsForPurchase,
	nextAdventureOptionsForPurchase,
} from './options-for-product';
import PrecancellationChatButton from './precancellation-chat-button';
import { AtomicRevertStep } from './step-components/atomic-revert-step';
import EducationContentStep from './step-components/educational-content-step';
import FeedbackStep from './step-components/feedback-step';
import NextAdventureStep from './step-components/next-adventure-step';
import UpsellStep from './step-components/upsell-step';
import {
	ATOMIC_REVERT_STEP,
	FEEDBACK_STEP,
	UPSELL_STEP,
	NEXT_ADVENTURE_STEP,
	REMOVE_PLAN_STEP,
} from './steps';

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
		skipRemovePlanSurvey: PropTypes.bool,
	};

	static defaultProps = {
		isVisible: false,
	};

	getAllSurveySteps() {
		const { purchase, skipRemovePlanSurvey, willAtomicSiteRevert } = this.props;
		let steps = [ FEEDBACK_STEP ];

		if (
			skipRemovePlanSurvey ||
			( isPartnerPurchase( purchase ) && isAgencyPartnerType( purchase.partnerType ) )
		) {
			steps = [];
		} else if ( ! isPlan( purchase ) ) {
			steps = [ NEXT_ADVENTURE_STEP ];
		} else if ( this.state.upsell ) {
			steps = [ FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP ];
		} else if ( this.state.questionTwoOrder.length ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		}

		if ( willAtomicSiteRevert ) {
			steps.push( ATOMIC_REVERT_STEP );
		}

		if ( skipRemovePlanSurvey && steps.length === 0 ) {
			steps.push( REMOVE_PLAN_STEP );
		}

		return steps;
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
			solution: '',
			upsell: '',
			atomicRevertCheckOne: false,
			atomicRevertCheckTwo: false,
			purchaseIsAlreadyExtended: false,
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
		const { purchaseIsAlreadyExtended } = this.state;
		const newState = {
			...this.state,
			questionOneText: value,
			upsell:
				getUpsellType( value, {
					productSlug: this.props.purchase?.productSlug || '',
					canRefund: !! parseFloat( this.getRefundAmount() ),
					canDowngrade: !! this.props.downgradeClick,
					canOfferFreeMonth: !! this.props.freeMonthOfferClick && ! purchaseIsAlreadyExtended,
				} ) || '',
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
				solution: '',
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

			if ( this.props.flowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
				this.props.cancelPurchaseSurveyCompleted( purchase.id );
			}
		}

		this.props.onClickFinalConfirm();

		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	downgradeClick = ( upsell ) => {
		if ( ! this.state.isSubmitting ) {
			this.props.downgradeClick( upsell );
			this.recordEvent( 'calypso_purchases_downgrade_form_submit' );
			this.setState( {
				solution: 'downgrade',
				isSubmitting: true,
			} );
		}
	};

	freeMonthOfferClick = () => {
		if ( ! this.state.isSubmitting ) {
			this.props.freeMonthOfferClick();
			this.recordEvent( 'calypso_purchases_free_month_offer_form_submit' );
			this.setState( {
				solution: 'free-month-offer',
				isSubmitting: true,
			} );
		}
	};

	getRefundAmount = () => {
		const { purchase } = this.props;
		const { refundOptions, currencyCode } = purchase;
		// TODO clk numberFormat pass through numberFormat if it stays
		const defaultFormatter = new Intl.NumberFormat( 'en-US', {
			style: 'currency',
			currency: currencyCode,
		} );
		const precision = defaultFormatter.resolvedOptions().maximumFractionDigits;
		const refundAmount =
			isRefundable( purchase ) && refundOptions?.[ 0 ]?.refund_amount
				? refundOptions[ 0 ].refund_amount
				: 0;

		return parseFloat( refundAmount ).toFixed( precision );
	};

	surveyContent() {
		const {
			atomicTransfer,
			translate,
			isImport,
			moment,
			purchase,
			site,
			hasBackupsFeature,
			flowType,
		} = this.props;
		const { atomicRevertCheckOne, atomicRevertCheckTwo, surveyStep, upsell } = this.state;
		const { productName } = purchase;

		if ( surveyStep === FEEDBACK_STEP ) {
			return (
				<FeedbackStep
					purchase={ purchase }
					isImport={ isImport }
					cancellationReasonCodes={ this.state.questionOneOrder }
					onChangeCancellationReason={ this.onRadioOneChange }
					onChangeCancellationReasonDetails={ this.onTextOneChange }
					onChangeImportFeedback={ this.onImportRadioChange }
				/>
			);
		}

		if ( surveyStep === UPSELL_STEP ) {
			const allSteps = this.getAllSurveySteps();
			const isLastStep = surveyStep === allSteps[ allSteps.length - 1 ];

			if ( upsell.startsWith( 'education:' ) ) {
				return (
					<EducationContentStep
						type={ upsell }
						site={ site }
						onDecline={ isLastStep ? this.onSubmit : this.clickNext }
						cancellationReason={ this.state.questionOneText }
					/>
				);
			}

			return (
				<UpsellStep
					upsell={ this.state.upsell }
					cancellationReason={ this.state.questionOneText }
					purchase={ purchase }
					site={ site }
					disabled={ this.state.isSubmitting }
					refundAmount={ this.getRefundAmount() }
					downgradePlanPrice={
						'downgrade-personal' === this.state.upsell
							? this.props.downgradePlanToPersonalPrice
							: this.props.downgradePlanToMonthlyPrice
					}
					downgradeClick={ this.downgradeClick }
					closeDialog={ this.closeDialog }
					cancelBundledDomain={ this.props.cancelBundledDomain }
					includedDomainPurchase={ this.props.includedDomainPurchase }
					onDeclineUpsell={ isLastStep ? this.onSubmit : this.clickNext }
					onClickDowngrade={ this.downgradeClick }
					onClickFreeMonthOffer={ this.freeMonthOfferClick }
				/>
			);
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			return (
				<NextAdventureStep
					isPlan={ isPlan( purchase ) }
					adventureOptions={ this.state.questionTwoOrder }
					onSelectNextAdventure={ this.onRadioTwoChange }
					onChangeNextAdventureDetails={ this.onTextTwoChange }
					onChangeText={ this.onTextThreeChange }
				/>
			);
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return (
				<AtomicRevertStep
					atomicTransfer={ atomicTransfer }
					purchase={ purchase }
					site={ site }
					atomicRevertCheckOne={ atomicRevertCheckOne }
					onClickCheckOne={ ( isChecked ) => this.setState( { atomicRevertCheckOne: isChecked } ) }
					atomicRevertCheckTwo={ atomicRevertCheckTwo }
					onClickCheckTwo={ ( isChecked ) => this.setState( { atomicRevertCheckTwo: isChecked } ) }
					hasBackupsFeature={ hasBackupsFeature }
					isRemovePlan={ flowType === CANCEL_FLOW_TYPE.REMOVE && isPlan( purchase ) }
				/>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<div className="cancel-purchase-form__remove-plan">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Sorry to see you go' ) }
						subHeaderText={
							<>
								<span className="cancel-purchase-form__remove-plan-text">
									{
										// Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business"
										translate(
											'If you remove your plan, you will lose access to the features of the %(planName)s plan.',
											{
												args: {
													planName: productName,
												},
											}
										)
									}
								</span>
								<span className="cancel-purchase-form__remove-plan-text">
									{
										// Translators: %(planName)s: name of the plan being canceled, eg: "WordPress.com Business". %(purchaseRenewalDate)s: date when the plan will expire, eg: "January 1, 2022"
										translate(
											'If you keep your plan, you will be able to continue using your %(planName)s plan features until {{strong}}%(purchaseRenewalDate)s{{/strong}}.',
											{
												args: {
													planName: productName,
													purchaseRenewalDate: moment( purchase.expiryDate ).format( 'LL' ),
												},
												components: {
													strong: <strong className="is-highlighted" />,
												},
											}
										)
									}
								</span>
							</>
						}
					/>
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

	canGoNext() {
		const { surveyStep, isSubmitting } = this.state;
		const { disableButtons, isImport } = this.props;

		if ( disableButtons || isSubmitting ) {
			return false;
		}

		if ( surveyStep === FEEDBACK_STEP ) {
			if ( isImport && ! this.state.importQuestionRadio ) {
				return false;
			}

			return Boolean( this.state.questionOneRadio && this.state.questionOneText );
		}

		if ( surveyStep === ATOMIC_REVERT_STEP ) {
			return Boolean( this.state.atomicRevertCheckOne && this.state.atomicRevertCheckTwo );
		}

		if ( surveyStep === NEXT_ADVENTURE_STEP ) {
			if ( this.state.questionTwoRadio === 'anotherReasonTwo' && ! this.state.questionTwoText ) {
				return false;
			}

			return true;
		}

		return ! disableButtons && ! isSubmitting;
	}

	getFinalActionText() {
		const { flowType, translate, disableButtons, purchase } = this.props;
		const { isSubmitting, solution } = this.state;
		const isRemoveFlow = flowType === CANCEL_FLOW_TYPE.REMOVE;
		const isCancelling = disableButtons || isSubmitting;

		if ( isCancelling && ! solution ) {
			return isRemoveFlow ? translate( 'Removing…' ) : translate( 'Cancelling…' );
		}

		if ( isPlan( purchase ) ) {
			if ( this.state.surveyStep === UPSELL_STEP ) {
				return isRemoveFlow
					? translate( 'Remove my current plan' )
					: translate( 'Cancel my current plan' );
			}

			return isRemoveFlow
				? translate( 'Submit and remove plan' )
				: translate( 'Submit and cancel plan' );
		}

		return isRemoveFlow
			? translate( 'Submit and remove product' )
			: translate( 'Submit and cancel product' );
	}

	renderStepButtons = () => {
		const { translate, disableButtons } = this.props;
		const { isSubmitting, surveyStep, solution } = this.state;
		const isCancelling = ( disableButtons || isSubmitting ) && ! solution;

		const allSteps = this.getAllSurveySteps();
		const isLastStep = surveyStep === allSteps[ allSteps.length - 1 ];

		if ( surveyStep === UPSELL_STEP ) {
			return null;
		}

		if ( ! isLastStep ) {
			return (
				<GutenbergButton
					isPrimary
					isDefault
					disabled={ ! this.canGoNext() }
					onClick={ this.clickNext }
				>
					{ translate( 'Submit' ) }
				</GutenbergButton>
			);
		}

		if ( surveyStep === REMOVE_PLAN_STEP ) {
			return (
				<>
					<GutenbergButton
						className="cancel-purchase-form__remove-plan-button"
						isPrimary
						isBusy={ isCancelling }
						disabled={ ! this.canGoNext() }
						onClick={ this.onSubmit }
					>
						{ this.getFinalActionText() }
					</GutenbergButton>
					<GutenbergButton
						isSecondary
						isBusy={ isCancelling }
						disabled={ ! this.canGoNext() }
						onClick={ this.closeDialog }
					>
						{ translate( 'Keep plan' ) }
					</GutenbergButton>
				</>
			);
		}

		return (
			<GutenbergButton
				isPrimary={ surveyStep !== UPSELL_STEP }
				isSecondary={ surveyStep === UPSELL_STEP }
				isDefault={ surveyStep !== UPSELL_STEP }
				isBusy={ isCancelling }
				disabled={ ! this.canGoNext() }
				onClick={ this.onSubmit }
			>
				{ this.getFinalActionText() }
			</GutenbergButton>
		);
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

	getCanceledProduct() {
		const {
			purchase: { productSlug, productName, meta },
			site: { slug },
			translate,
		} = this.props;
		const headerTitle = this.getHeaderTitle();
		switch ( productSlug ) {
			case 'domain_map':
				/* 	Translators: If canceled product is domain connection,
					displays canceled product and domain connection being canceled
					eg: "Remove product: Domain Connection for externaldomain.com" */
				return translate( '%(headerTitle)s: %(productName)s for %(purchaseMeta)s', {
					args: { headerTitle, productName, purchaseMeta: meta },
				} );
			case 'offsite_redirect':
				/* 	Translators: If canceled product is site redirect,
					displays canceled product and domain site is being directed to
					eg: "Remove product: Site Redirect to redirectedsite.com" */
				return translate( '%(headerTitle)s: %(productName)s to %(purchaseMeta)s', {
					args: { headerTitle, productName, purchaseMeta: meta },
				} );
			default:
				/* Translators: If canceled product is site plan or other product,
					displays plan or product being canceled and primary address of product being canceled
					eg: "Cancel plan: WordPress.com Business for primarydomain.com" */
				return translate( '%(headerTitle)s: %(productName)s for %(siteSlug)s', {
					args: { headerTitle, productName, siteSlug: slug },
				} );
		}
	}
	render() {
		const { purchase, site } = this.props;
		const { surveyStep } = this.state;

		if ( ! surveyStep ) {
			return null;
		}

		return (
			<>
				{ /** QueryProducts added to ensure currency-code state gets populated for usages of getCurrentUserCurrencyCode */ }
				<QueryProducts />
				{ site && <QuerySitePlans siteId={ site.ID } /> }
				{ this.props.isVisible && (
					<BlankCanvas className="cancel-purchase-form">
						<BlankCanvas.Header onBackClick={ this.closeDialog }>
							{ site && (
								<span className="cancel-purchase-form__site-slug">
									{ this.getCanceledProduct() }
								</span>
							) }
							<PrecancellationChatButton
								icon="chat_bubble"
								onClick={ this.closeDialog }
								purchase={ purchase }
								surveyStep={ surveyStep }
							/>
						</BlankCanvas.Header>
						<BlankCanvas.Content>{ this.surveyContent() }</BlankCanvas.Content>
						<BlankCanvas.Footer>
							<div className="cancel-purchase-form__actions">
								<div
									className={ `cancel-purchase-form__buttons cancel-purchase-form__${ surveyStep }-buttons` }
								>
									{ this.renderStepButtons() }
								</div>
							</div>
						</BlankCanvas.Footer>
					</BlankCanvas>
				) }
			</>
		);
	}
}

const ConnectedCancelPurchaseForm = connect(
	( state, { purchase, linkedPurchases } ) => ( {
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
		isImport: !! getSiteImportEngine( state, purchase.siteId ),
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
		cancelPurchaseSurveyCompleted,
		fetchAtomicTransfer,
		recordTracksEvent,
		submitSurvey,
	}
)( localize( withLocalizedMoment( CancelPurchaseForm ) ) );

const WrappedCancelPurchaseForm = ( props ) => {
	const personalDowngradePlan = getDowngradePlanFromPurchase( props.purchase );
	const monthlyDowngradePlan = getDowngradePlanToMonthlyFromPurchase( props.purchase );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ personalDowngradePlan?.getStoreSlug(), monthlyDowngradePlan?.getStoreSlug() ],
		coupon: undefined,
		siteId: null,
		useCheckPlanAvailabilityForPurchase,
	} );

	return (
		<ConnectedCancelPurchaseForm
			{ ...props }
			downgradePlanToPersonalPrice={
				pricingMeta?.[ personalDowngradePlan?.getStoreSlug() ]?.originalPrice?.full
			}
			downgradePlanToMonthlyPrice={
				pricingMeta?.[ monthlyDowngradePlan?.getStoreSlug() ]?.originalPrice?.full
			}
		/>
	);
};

export default WrappedCancelPurchaseForm;
