import config from '@automattic/calypso-config';
import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackProduct,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import { Button, CompactCard, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CancelJetpackForm from 'calypso/components/marketing-survey/cancel-jetpack-form';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import GSuiteCancellationPurchaseDialog from 'calypso/components/marketing-survey/gsuite-cancel-purchase-dialog';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'calypso/lib/purchases';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { removePurchase } from 'calypso/state/purchases/actions';
import {
	getPurchasesError,
	shouldRevertAtomicSiteBeforeDeactivation,
} from 'calypso/state/purchases/selectors';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { purchasesRoot } from '../paths';
import { isDataLoading } from '../utils';
import RemoveDomainDialog from './remove-domain-dialog';

import './style.scss';

class RemovePurchase extends Component {
	static propTypes = {
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		hasNonPrimaryDomainsFlag: PropTypes.bool,
		isDomainOnlySite: PropTypes.bool,
		hasCustomPrimaryDomain: PropTypes.bool,
		receiveDeletedSite: PropTypes.func.isRequired,
		removePurchase: PropTypes.func.isRequired,
		purchase: PropTypes.object,
		site: PropTypes.object,
		setAllSitesSelected: PropTypes.func.isRequired,
		userId: PropTypes.number.isRequired,
		useVerticalNavItem: PropTypes.bool,
		onClickTracks: PropTypes.func,
		purchaseListUrl: PropTypes.string,
	};

	static defaultProps = {
		purchaseListUrl: purchasesRoot,
	};

	state = {
		isDialogVisible: false,
		isRemoving: false,
		isShowingNonPrimaryDomainWarning: false,
	};

	closeDialog = () => {
		this.setState( {
			isDialogVisible: false,
			isShowingNonPrimaryDomainWarning: false,
		} );
	};

	showRemovePlanDialog = () => {
		this.setState( {
			isShowingNonPrimaryDomainWarning: false,
			isDialogVisible: true,
		} );
	};

	openDialog = ( event ) => {
		event.preventDefault();

		if ( this.props.onClickTracks ) {
			this.props.onClickTracks( event );
		}
		if (
			this.shouldShowNonPrimaryDomainWarning() &&
			! this.state.isShowingNonPrimaryDomainWarning
		) {
			this.setState( {
				isShowingNonPrimaryDomainWarning: true,
				isDialogVisible: false,
			} );
		} else {
			this.setState( {
				isShowingNonPrimaryDomainWarning: false,
				isDialogVisible: true,
			} );
		}
	};

	onClickChatButton = () => {
		this.setState( { isDialogVisible: false } );
	};

	removePurchase = async () => {
		this.setState( { isRemoving: true } );

		const { isDomainOnlySite, purchase, translate } = this.props;

		await this.props.removePurchase( purchase.id, this.props.userId );

		const productName = getName( purchase );
		const { purchasesError, purchaseListUrl } = this.props;
		let successMessage;

		if ( purchasesError ) {
			this.setState( { isRemoving: false } );
			this.closeDialog();
			this.props.errorNotice( purchasesError );
			return;
		}

		if ( isDomainRegistration( purchase ) ) {
			if ( isDomainOnlySite ) {
				this.props.receiveDeletedSite( purchase.siteId );
				this.props.setAllSitesSelected();
			}

			successMessage = translate( 'The domain {{domain/}} was removed from your account.', {
				components: { domain: <em>{ productName }</em> },
			} );
		} else {
			successMessage = translate( '%(productName)s was removed from {{siteName/}}.', {
				args: { productName },
				components: { siteName: <em>{ purchase.domain }</em> },
			} );
		}

		this.props.successNotice( successMessage, { isPersistent: true } );
		page( purchaseListUrl );
	};

	getChatButton = () => (
		<PrecancellationChatButton
			onClick={ this.onClickChatButton }
			purchase={ this.props.purchase }
		/>
	);

	getContactUsButton = () => {
		return (
			<Button className="remove-purchase__support-link-button" href="/help/contact/">
				{ this.props.translate( 'Contact Us' ) }
			</Button>
		);
	};

	shouldShowNonPrimaryDomainWarning() {
		const { hasNonPrimaryDomainsFlag, isAtomicSite, hasCustomPrimaryDomain, purchase } = this.props;
		return (
			hasNonPrimaryDomainsFlag && isPlan( purchase ) && ! isAtomicSite && hasCustomPrimaryDomain
		);
	}

	renderNonPrimaryDomainWarningDialog() {
		const { purchase, site } = this.props;
		return (
			<NonPrimaryDomainDialog
				isDialogVisible={ this.state.isShowingNonPrimaryDomainWarning }
				closeDialog={ this.closeDialog }
				removePlan={ this.showRemovePlanDialog }
				planName={ getName( purchase ) }
				oldDomainName={ site.domain }
				newDomainName={ site.wpcom_url }
			/>
		);
	}

	renderDomainDialog() {
		let chatButton = null;

		if ( config.isEnabled( 'upgrades/precancellation-chat' ) ) {
			chatButton = this.getChatButton();
		}

		return (
			<RemoveDomainDialog
				isRemoving={ this.state.isRemoving }
				isDialogVisible={ this.state.isDialogVisible }
				removePurchase={ this.removePurchase }
				closeDialog={ this.closeDialog }
				chatButton={ chatButton }
				purchase={ this.props.purchase }
			/>
		);
	}

	renderDomainMappingDialog() {
		const { purchase } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				defaultContent={ this.renderDomainMappingDialogText() }
				purchase={ purchase }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	renderDomainMappingDialogText() {
		const { purchase, translate } = this.props;
		const domainName = getName( purchase );
		const domainProductName = purchase.productName;

		return (
			<div>
				<p>
					{
						/* translators: "domainName" is the URL of the Domain Connection being removed (example: "mygroovysite.com"). "domainProductName" is a product name (in this case, Domain Connection).  */
						translate( 'Are you sure you want to remove %(domainName)s from {{site/}}?', {
							args: { domainName },
							components: { site: <em>{ purchase.domain }</em> },
							/* translators:  ^ "site" is the internal WPcom domain i.e. example.wordpress.com */
						} )
					}{ ' ' }
					{ translate(
						'You will not be able to reuse it again without starting a new %(domainProductName)s subscription.',
						{
							args: { domainProductName },
							comment: "'domainProductName' refers to Domain Mapping in this case.",
						}
					) }
				</p>
			</div>
		);
	}

	renderPlanDialog() {
		const { purchase } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				defaultContent={ this.renderPlanDialogText() }
				purchase={ purchase }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
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
					{
						/* translators: productName is a product name, like Jetpack.
					 domain is something like example.wordpress.com */
						translate( 'Are you sure you want to remove %(productName)s from {{domain/}}?', {
							args: { productName },
							components: { domain: <em>{ purchase.domain }</em> },
							// ^ is the internal WPcom domain i.e. example.wordpress.com
							// if we want to use the purchased domain we can swap with the below line
							//{ components: { domain: <em>{ getIncludedDomain( purchase ) }</em> } }
						} )
					}{ ' ' }
					{ isDomainRegistration &&
						translate(
							'You will not be able to reuse it again without starting a new subscription.',
							{
								comment: "'it' refers to a product purchased by a user",
							}
						) }
				</p>

				{ isPlan( purchase ) && hasIncludedDomain( purchase ) && includedDomainText }
			</div>
		);
	}

	renderJetpackDialog() {
		const { purchase } = this.props;

		return (
			<CancelJetpackForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }
				onClickFinalConfirm={ this.removePurchase }
				flowType={ CANCEL_FLOW_TYPE.REMOVE }
			/>
		);
	}

	renderDialog() {
		const { purchase } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			return this.renderDomainDialog();
		}

		if ( isDomainMapping( purchase ) ) {
			return this.renderDomainMappingDialog();
		}

		if ( isDomainTransfer( purchase ) || isTitanMail( purchase ) ) {
			return this.renderPlanDialog();
		}

		if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
			return (
				<GSuiteCancellationPurchaseDialog
					isVisible={ this.state.isDialogVisible }
					onClose={ this.closeDialog }
					purchase={ purchase }
					site={ this.props.site }
				/>
			);
		}

		// Jetpack Plan or Product Cancellation
		if ( this.props.isJetpack ) {
			return this.renderJetpackDialog();
		}

		return this.renderPlanDialog();
	}

	render() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		// If we have a disconnected site that is _not_ a Jetpack purchase, no removal allowed.
		if ( ! this.props.site && ! this.props.isJetpack ) {
			return null;
		}

		const { className, purchase, translate, useVerticalNavItem } = this.props;
		const productName = getName( purchase );

		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		const defaultContent = (
			<>
				<Gridicon icon="trash" />
				{
					// translators: productName is a product name, like Jetpack
					translate( 'Remove %(productName)s', { args: { productName } } )
				}
			</>
		);

		const wrapperClassName = classNames( 'remove-purchase__card', className );
		const Wrapper = useVerticalNavItem ? VerticalNavItem : CompactCard;

		return (
			<>
				<Wrapper tagName="button" className={ wrapperClassName } onClick={ this.openDialog }>
					{ this.props.children ? this.props.children : defaultContent }
				</Wrapper>
				{ this.shouldShowNonPrimaryDomainWarning() && this.renderNonPrimaryDomainWarningDialog() }
				{ this.renderDialog() }
			</>
		);
	}
}

export default connect(
	( state, { purchase } ) => {
		const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );
		return {
			isDomainOnlySite: purchase && isDomainOnly( state, purchase.siteId ),
			isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
			isChatAvailable: isHappychatAvailable( state ),
			isJetpack,
			purchasesError: getPurchasesError( state ),
			shouldRevertAtomicSite: shouldRevertAtomicSiteBeforeDeactivation( state, purchase.id ),
			userId: getCurrentUserId( state ),
		};
	},
	{
		errorNotice,
		receiveDeletedSite,
		recordTracksEvent,
		removePurchase,
		setAllSitesSelected,
		successNotice,
	}
)( localize( RemovePurchase ) );
