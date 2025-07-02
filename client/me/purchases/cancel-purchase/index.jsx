import {
	isDomainRegistration,
	isDomainTransfer,
	isPlan,
	hasMarketplaceProduct,
	isJetpackPlan,
	isJetpackProduct,
	getPlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, CompactCard } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import BackupRetentionOptionOnCancelPurchase from 'calypso/components/backup-retention-management/retention-option-on-cancel-purchase';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getName,
	purchaseType,
	hasAmountAvailableToRefund,
	canAutoRenewBeTurnedOff,
	isOneTimePurchase,
	isRefundable,
	isSubscription,
} from 'calypso/lib/purchases';
import CancelPurchaseLoadingPlaceholder from 'calypso/me/purchases/cancel-purchase/loading-placeholder';
import { managePurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import ProductLink from 'calypso/me/purchases/product-link';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	getIncludedDomainPurchase,
} from 'calypso/state/purchases/selectors';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import SupportLink from '../cancel-purchase-support-link/support-link';
import AtomicRevertChanges from './atomic-revert-changes';
import CancelPurchaseButton from './button';
import CancelPurchaseDomainOptions from './domain-options';
import CancelPurchaseFeatureList from './feature-list';
import CancelPurchaseRefundInformation from './refund-information';

import './style.scss';

class CancelPurchase extends Component {
	static propTypes = {
		purchaseListUrl: PropTypes.string,
		getManagePurchaseUrlFor: PropTypes.func,
		getConfirmCancelDomainUrlFor: PropTypes.func,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		includedDomainPurchase: PropTypes.object,
		isJetpackPurchase: PropTypes.bool,
		purchase: PropTypes.object,
		purchaseId: PropTypes.number.isRequired,
		site: PropTypes.object,
		siteSlug: PropTypes.string.isRequired,
		atomicTransfer: PropTypes.object,
	};

	state = {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
		surveyShown: false,
		atomicRevertConfirmed: false,
		isLoading: false,
		domainConfirmationConfirmed: false,
	};

	static defaultProps = {
		getManagePurchaseUrlFor: managePurchase,
		purchaseListUrl: purchasesRoot,
	};

	componentDidMount() {
		if ( ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.state.surveyShown ) {
			return;
		}

		if ( this.isDataValid( prevProps ) && ! this.isDataValid() ) {
			this.redirect();
			return;
		}
	}

	isDataValid = ( props = this.props ) => {
		if ( isDataLoading( props ) ) {
			return true;
		}

		const { purchase } = props;

		if ( ! purchase ) {
			return false;
		}

		const isDomainTransferCancelable = isRefundable( purchase ) || ! isDomainTransfer( purchase );
		const isValidForCancellation =
			canAutoRenewBeTurnedOff( purchase ) && isDomainTransferCancelable;

		if ( ! isValidForCancellation && this.state.surveyShown ) {
			return true;
		}

		return isValidForCancellation;
	};

	redirect = () => {
		const { purchase, siteSlug } = this.props;
		let redirectPath = this.props.purchaseListUrl;

		if (
			siteSlug &&
			purchase &&
			( ! canAutoRenewBeTurnedOff( purchase ) || isDomainTransfer( purchase ) )
		) {
			redirectPath = this.props.getManagePurchaseUrlFor( siteSlug, purchase.id );
		}

		page.redirect( redirectPath );
	};

	onCancelConfirmationStateChange = ( newState ) => {
		this.setState( newState );
	};

	onCancellationStart = () => {
		this.setState( { surveyShown: true, isLoading: true } );
	};

	onSurveyComplete = () => {
		this.setState( { surveyShown: false, isLoading: false } );
	};

	onAtomicRevertConfirmationChange = ( isConfirmed ) => {
		this.setState( { atomicRevertConfirmed: isConfirmed } );
	};

	onDomainConfirmationChange = () => {
		this.setState( { domainConfirmationConfirmed: ! this.state.domainConfirmationConfirmed } );
	};

	getActiveMarketplaceSubscriptions() {
		const { purchase, purchases, productsList } = this.props;

		if ( ! isPlan( purchase ) ) {
			return [];
		}

		return purchases.filter(
			( _purchase ) =>
				_purchase.active && hasMarketplaceProduct( productsList, _purchase.productSlug )
		);
	}

	renderExpirationText = () => {
		const { purchase, translate } = this.props;
		const { expiryDate } = purchase;

		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		if ( isDomainRegistration( purchase ) ) {
			// Domain in AGP bought with domain credits
			if ( isRefundable( purchase ) ) {
				return translate(
					'After you confirm this change, the domain will be removed immediately.'
				);
			}
			return translate(
				'After you confirm this change, the domain will be removed on %(expirationDate)s.',
				{
					args: { expirationDate },
				}
			);
		}

		return translate(
			'After you confirm this change, the subscription will be removed on %(expirationDate)s.',
			{
				args: { expirationDate },
			}
		);
	};

	renderFullText = () => {
		const { includedDomainPurchase, purchase, translate } = this.props;
		const { expiryDate } = purchase;
		const expirationDate = this.props.moment( expiryDate ).format( 'LL' );

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			includedDomainPurchase
		);

		if ( refundAmountString ) {
			return translate(
				'If you confirm this cancellation, you will receive a {{span}}refund of %(refundText)s{{/span}}, and your subscription will be removed immediately.',
				{
					args: {
						refundText: refundAmountString,
					},
					context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
					components: {
						span: <span className="cancel-purchase__refund-string" />,
					},
				}
			);
		}

		return translate(
			'If you complete this cancellation, your subscription will be removed on {{span}}%(expirationDate)s{{/span}}.',
			{
				args: {
					expirationDate,
				},
				components: {
					span: <span className="cancel-purchase__warning-string" />,
				},
			}
		);
	};

	renderFooterText = () => {
		const { purchase, translate } = this.props;

		const refundAmountString = this.renderRefundAmountString(
			purchase,
			this.state.cancelBundledDomain,
			this.props.includedDomainPurchase
		);

		if ( refundAmountString ) {
			return translate( '%(refundText)s to be refunded', {
				args: {
					refundText: refundAmountString,
				},
				context: 'refundText is of the form "[currency-symbol][amount]" i.e. "$20"',
			} );
		}
	};

	renderRefundAmountString = ( purchase, cancelBundledDomain, includedDomainPurchase ) => {
		const { refundInteger, totalRefundInteger, totalRefundCurrency } = purchase;

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( cancelBundledDomain && includedDomainPurchase ) {
				return formatCurrency( totalRefundInteger, totalRefundCurrency, {
					isSmallestUnit: true,
				} );
			}
			return formatCurrency( refundInteger, totalRefundCurrency, {
				isSmallestUnit: true,
			} );
		}

		return null;
	};

	renderCancelButton = () => {
		const {
			purchase,
			includedDomainPurchase,
			siteSlug,
			purchaseListUrl,
			getConfirmCancelDomainUrlFor,
		} = this.props;

		// Check if we need atomic revert confirmation
		const needsAtomicRevertConfirmation =
			this.props.atomicTransfer?.created_at && ! isRefundable( purchase );

		const isDisabled =
			( this.state.cancelBundledDomain && ! this.state.confirmCancelBundledDomain ) ||
			( needsAtomicRevertConfirmation &&
				! this.state.atomicRevertConfirmed &&
				isPlan( purchase ) ) ||
			( isDomainRegistration( purchase ) && ! this.state.domainConfirmationConfirmed );

		return (
			<CancelPurchaseButton
				purchase={ purchase }
				includedDomainPurchase={ includedDomainPurchase }
				disabled={ isDisabled }
				siteSlug={ siteSlug }
				cancelBundledDomain={ this.state.cancelBundledDomain }
				purchaseListUrl={ purchaseListUrl }
				getConfirmCancelDomainUrlFor={ getConfirmCancelDomainUrlFor }
				activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
				onCancellationStart={ this.onCancellationStart }
				onSurveyComplete={ this.onSurveyComplete }
				moment={ this.props.moment }
			/>
		);
	};

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		if ( isDataLoading( this.props ) ) {
			return (
				<div>
					<QueryUserPurchases />
					<CancelPurchaseLoadingPlaceholder />
				</div>
			);
		}

		if ( this.props.isHundredYearDomain ) {
			this.redirect();
			return null;
		}

		const { purchase, isJetpackPurchase } = this.props;
		const purchaseName = getName( purchase );
		const plan = getPlan( purchase?.productSlug );
		const planDescription = plan?.getPlanCancellationDescription?.();
		const { siteName, siteId } = purchase;

		const cancellationFeatures =
			plan && 'getCancellationFeatures' in plan ? plan.getCancellationFeatures?.() ?? [] : [];

		let heading;

		if ( isDomainRegistration( purchase ) || isOneTimePurchase( purchase ) ) {
			heading = this.props.translate( 'Cancel %(purchaseName)s', {
				args: { purchaseName },
			} );
		}

		if ( isSubscription( purchase ) ) {
			heading = this.props.translate( 'Cancel your %(purchaseName)s subscription', {
				args: { purchaseName },
			} );
		}

		return (
			<Card className="cancel-purchase__wrapper-card">
				<QueryProductsList />
				<TrackPurchasePageView
					eventName="calypso_cancel_purchase_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>

				<div className="cancel-purchase__back">
					<HeaderCakeBack
						icon="chevron-left"
						href={ this.props.getManagePurchaseUrlFor(
							this.props.siteSlug,
							this.props.purchaseId
						) }
					/>
				</div>

				<FormattedHeader
					className="cancel-purchase__formatted-header"
					brandFont
					headerText={ heading }
					align="left"
				/>

				<div className="cancel-purchase__inner-wrapper">
					<div className="cancel-purchase__left">
						<CancelPurchaseDomainOptions
							includedDomainPurchase={ this.props.includedDomainPurchase }
							cancelBundledDomain={ this.state.cancelBundledDomain }
							onCancelConfirmationStateChange={ this.onCancelConfirmationStateChange }
							purchase={ purchase }
							isLoading={ this.state.isLoading }
						/>

						{ this.props.includedDomainPurchase &&
							this.props.atomicTransfer?.created_at &&
							! isRefundable( purchase ) && (
								<h2 className="formatted-header__title formatted-header__title--cancellation-flow">
									{ this.props.translate( 'What happens when you cancel' ) }
								</h2>
							) }

						<BackupRetentionOptionOnCancelPurchase purchase={ purchase } />

						<CancelPurchaseRefundInformation
							purchase={ purchase }
							isJetpackPurchase={ isJetpackPurchase }
						/>

						<CancelPurchaseFeatureList
							purchase={ purchase }
							cancellationFeatures={ cancellationFeatures }
						/>

						{ ! cancellationFeatures.length ? (
							<>
								<CompactCard className="cancel-purchase__product-information">
									<div className="cancel-purchase__purchase-name">{ purchaseName }</div>
									<div className="cancel-purchase__description">{ purchaseType( purchase ) }</div>
									{ planDescription && (
										<div className="cancel-purchase__plan-description">{ planDescription }</div>
									) }
									<ProductLink purchase={ purchase } selectedSite={ this.props.site } />
								</CompactCard>

								<CompactCard className="cancel-purchase__footer">
									{ isDomainRegistration( purchase ) && (
										<div className="cancel-purchase__domain-confirmation">
											<FormCheckbox
												checked={ this.state.domainConfirmationConfirmed }
												onChange={ this.onDomainConfirmationChange }
											/>
											<span>
												{ this.props.translate(
													'I understand that canceling means that I may {{strong}}lose this domain forever{{/strong}}.',
													{
														components: {
															strong: <strong />,
														},
													}
												) }
											</span>
										</div>
									) }
									<div className="cancel-purchase__footer-text-wrapper">
										<div className="cancel-purchase__footer-text">
											{ hasAmountAvailableToRefund( purchase ) ? (
												<p className="cancel-purchase__refund-amount">
													{ this.renderFooterText() }
												</p>
											) : (
												<p className="cancel-purchase__expiration-text">
													{ this.renderExpirationText() }
												</p>
											) }
										</div>
										{ this.renderCancelButton() }
									</div>
								</CompactCard>
							</>
						) : (
							<>
								<AtomicRevertChanges
									atomicTransfer={ this.props.atomicTransfer }
									purchase={ purchase }
									onConfirmationChange={ this.onAtomicRevertConfirmationChange }
									needsAtomicRevertConfirmation={
										this.props.atomicTransfer?.created_at && ! isRefundable( purchase )
									}
									isLoading={ this.state.isLoading }
								/>

								<p>{ this.renderFullText() }</p>

								<div className="cancel-purchase__confirm-buttons">
									{ this.renderCancelButton() }
									<FormButton
										isPrimary={ false }
										disabled={ this.state.isLoading }
										href={ this.props.getManagePurchaseUrlFor(
											this.props.siteSlug,
											this.props.purchaseId
										) }
									>
										{ this.props.translate( 'Keep subscription' ) }
									</FormButton>
								</div>
							</>
						) }
					</div>

					<div className="cancel-purchase__right">
						<div className="cancel-purchase__sticky-sidebar">
							<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
							<SupportLink usage="cancel-purchase" purchase={ purchase } />
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const isJetpackPurchase =
		purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
	const purchases = purchase && getSitePurchases( state, purchase.siteId );
	const productsList = getProductsList( state );

	const domains = purchase && getDomainsBySiteId( state, purchase.siteId );
	const selectedDomainName = purchase && getName( purchase );
	const selectedDomain =
		domains && selectedDomainName && getSelectedDomain( { domains, selectedDomainName } );

	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		isJetpackPurchase,
		purchase,
		purchases,
		productsList,
		includedDomainPurchase: getIncludedDomainPurchase( state, purchase ),
		site: getSite( state, purchase ? purchase.siteId : null ),
		isHundredYearDomain: selectedDomain?.isHundredYearDomain,
		atomicTransfer: getAtomicTransfer( state, purchase?.siteId ),
	};
} )( localize( withLocalizedMoment( CancelPurchase ) ) );
