/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Dialog, Button, CompactCard } from '@automattic/components';
import config from '@automattic/calypso-config';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import GSuiteCancellationPurchaseDialog from 'calypso/components/marketing-survey/gsuite-cancel-purchase-dialog';
import { getIncludedDomain, getName, hasIncludedDomain, isRemovable } from 'calypso/lib/purchases';
import { isDataLoading } from '../utils';
import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isJetpackPlan,
	isJetpackProduct,
	isPlan,
	isJetpackSearch,
	isTitanMail,
} from '@automattic/calypso-products';
import { purchasesRoot } from '../paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import { removePurchase } from 'calypso/state/purchases/actions';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveDeletedSite } from 'calypso/state/sites/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import RemoveDomainDialog from './remove-domain-dialog';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

/**
 * Style dependencies
 */
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
		survey: {},
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

	onSurveyChange = ( update ) => {
		this.setState( {
			survey: update,
		} );
	};

	removePurchase = () => {
		this.setState( { isRemoving: true } );

		const { isDomainOnlySite, purchase, translate } = this.props;

		this.props.removePurchase( purchase.id, this.props.userId ).then( () => {
			const productName = getName( purchase );
			const { purchasesError, purchaseListUrl } = this.props;

			if ( purchasesError ) {
				this.setState( { isRemoving: false } );

				this.closeDialog();

				this.props.errorNotice( purchasesError );
			} else {
				if ( isDomainRegistration( purchase ) ) {
					if ( isDomainOnlySite ) {
						this.props.receiveDeletedSite( purchase.siteId );
						this.props.setAllSitesSelected();
					}

					this.props.successNotice(
						translate( 'The domain {{domain/}} was removed from your account.', {
							components: { domain: <em>{ productName }</em> },
						} ),
						{ isPersistent: true }
					);
				} else {
					this.props.successNotice(
						translate( '%(productName)s was removed from {{siteName/}}.', {
							args: { productName },
							components: { siteName: <em>{ purchase.domain }</em> },
						} ),
						{ isPersistent: true }
					);
				}

				page( purchaseListUrl );
			}
		} );
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

		if (
			config.isEnabled( 'upgrades/precancellation-chat' ) &&
			this.state.surveyStep !== 'happychat_step'
		) {
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

	renderPlanDialog() {
		const { purchase, site } = this.props;

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				defaultContent={ this.renderPlanDialogText() }
				onInputChange={ this.onSurveyChange }
				purchase={ purchase }
				selectedSite={ site }
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
					{ translate(
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
		const supportButton = this.props.isChatAvailable
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

	renderDialog() {
		const { purchase } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			return this.renderDomainDialog();
		}

		if ( isDomainMapping( purchase ) || isDomainTransfer( purchase ) || isTitanMail( purchase ) ) {
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

		if ( this.props.isAtomicSite && ! isJetpackSearch( purchase ) ) {
			return this.renderAtomicDialog( purchase );
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

		const { purchase, className, useVerticalNavItem, translate } = this.props;
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
