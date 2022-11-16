import {
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isWpComMonthlyPlan,
} from '@automattic/calypso-products';
import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products/src';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { SUPPORT_HAPPYCHAT } from '@automattic/help-center';
import { Button as GutenbergButton, CheckboxControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
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
import FeedbackStep from './step-components/feedback-step';
import NextAdventureStep from './step-components/next-adventure-step';
import UpsellStep from './step-components/upsell-step';
import { ATOMIC_REVERT_STEP, FEEDBACK_STEP, UPSELL_STEP, NEXT_ADVENTURE_STEP } from './steps';
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
		const { willAtomicSiteRevert } = this.props;
		let steps = [ FEEDBACK_STEP ];

		if ( ! isPlan( this.props.purchase ) ) {
			steps = [ NEXT_ADVENTURE_STEP ];
		} else if ( this.state.upsell ) {
			steps = [ FEEDBACK_STEP, UPSELL_STEP ];
		} else if ( this.state.questionTwoOrder.length ) {
			steps = [ FEEDBACK_STEP, NEXT_ADVENTURE_STEP ];
		}

		if ( willAtomicSiteRevert ) {
			steps.push( ATOMIC_REVERT_STEP );
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
			return (
				<UpsellStep
					upsell={ this.state.upsell }
					purchase={ purchase }
					site={ site }
					disabled={ this.state.isSubmitting }
					refundAmount={ this.getRefundAmount() }
					downgradePlanPrice={ this.props.downgradePlanPrice }
					downgradeClick={ this.downgradeClick }
					cancelBundledDomain={ this.props.cancelBundledDomain }
					includedDomainPurchase={ this.props.includedDomainPurchase }
					onDeclineUpsell={ this.onSubmit }
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

	canGoNext() {
		const { surveyStep, isSubmitting } = this.state;
		const { disableButtons, isImport } = this.props;

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

		return (
			<>
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
			</>
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

	render() {
		const { isChatActive, isChatAvailable, purchase, site, supportVariation } = this.props;
		const { surveyStep } = this.state;
		const shouldShowChatButton =
			( isChatAvailable || isChatActive ) && supportVariation === SUPPORT_HAPPYCHAT;

		if ( ! surveyStep ) {
			return null;
		}

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
							{ shouldShowChatButton && (
								<PrecancellationChatButton
									icon="chat_bubble"
									onClick={ this.closeDialog }
									purchase={ purchase }
									surveyStep={ surveyStep }
									atBottom={ false }
								/>
							) }
						</BlankCanvas.Header>
						<BlankCanvas.Content>{ this.surveyContent() }</BlankCanvas.Content>
						<BlankCanvas.Footer>
							<div className="cancel-purchase-form__actions">
								<div className="cancel-purchase-form__buttons">{ this.renderStepButtons() }</div>
								{ shouldShowChatButton && (
									<PrecancellationChatButton
										icon="chat_bubble"
										onClick={ this.closeDialog }
										purchase={ purchase }
										surveyStep={ surveyStep }
										atBottom={ true }
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
