import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelFigureHeader from 'calypso/components/action-panel/figure-header';
import ActionPanelFigureList from 'calypso/components/action-panel/figure-list';
import ActionPanelFigureListItem from 'calypso/components/action-panel/figure-list-item';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import ActionPanelLink from 'calypso/components/action-panel/link';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import NavigationHeader from 'calypso/components/navigation-header';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { hasLoadedUserPurchasesFromServer } from 'calypso/state/purchases/selectors';
import getAccountClosureSites from 'calypso/state/selectors/get-account-closure-sites';
import getUserPurchasedPremiumThemes from 'calypso/state/selectors/get-user-purchased-premium-themes';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import isAccountClosed from 'calypso/state/selectors/is-account-closed';
import userHasAnyAtomicSites from 'calypso/state/selectors/user-has-any-atomic-sites';
import AccountCloseConfirmDialog from './confirm-dialog';

import './style.scss';

class AccountSettingsClose extends Component {
	state = {
		showConfirmDialog: false,
		showSiteDropdown: true,
	};

	componentDidUpdate() {
		// If the account is closed, logout
		if ( this.props.isAccountClosed === true ) {
			this.props.redirectToLogout();
		}
	}

	goBack = () => {
		page( '/me/account' );
	};

	handleDeleteClick = ( event ) => {
		event.preventDefault();

		// Check if purchases and sites have loaded
		if ( this.props.isLoading ) {
			return false;
		}

		this.setState( { showConfirmDialog: true } );
	};

	closeConfirmDialog = () => {
		this.setState( { showConfirmDialog: false } );
	};

	handleSiteDropdown = () => {
		this.setState( ( state ) => ( {
			showSiteDropdown: ! state.showSiteDropdown,
		} ) );
	};

	render() {
		const { translate, hasAtomicSites, hasCancelablePurchases, isLoading, purchasedPremiumThemes } =
			this.props;
		const isDeletePossible = ! isLoading && ! hasAtomicSites && ! hasCancelablePurchases;
		const containerClasses = clsx( 'account-close', 'main', 'is-wide-layout', {
			'is-loading': isLoading,
			'is-hiding-other-sites': this.state.showSiteDropdown,
		} );

		return (
			<div className={ containerClasses } role="main">
				<QueryUserPurchases />
				<NavigationHeader navigationItems={ [] } title={ translate( 'Account Settings' ) } />

				<HeaderCake onClick={ this.goBack }>
					<h1>{ translate( 'Delete account' ) }</h1>
				</HeaderCake>
				<ActionPanel>
					<ActionPanelBody>
						{ isDeletePossible && (
							<ActionPanelFigure>
								<ActionPanelFigureHeader>
									{ translate( 'These items will be deleted' ) }
								</ActionPanelFigureHeader>
								<ActionPanelFigureList>
									<ActionPanelFigureListItem>
										{ translate( 'Personal details' ) }
									</ActionPanelFigureListItem>
									{ this.props.sitesToBeDeleted.length > 0 && (
										<Fragment>
											<ActionPanelFigureListItem className="account-close__sites-item">
												{ translate( 'Sites' ) }
												<Gridicon
													size={ 18 }
													onClick={ this.handleSiteDropdown }
													icon="chevron-down"
												/>
												{ this.state.showSiteDropdown && (
													<ul className="account-close__sites-list">
														{ this.props.sitesToBeDeleted.map( ( sitesToBeDeleted ) => (
															<li key={ sitesToBeDeleted.slug }>
																{ [ sitesToBeDeleted.name ] }
																<span>{ [ sitesToBeDeleted.slug ] }</span>
															</li>
														) ) }
													</ul>
												) }
											</ActionPanelFigureListItem>
											<ActionPanelFigureListItem>
												{ translate( 'Posts' ) }
											</ActionPanelFigureListItem>
											<ActionPanelFigureListItem>
												{ translate( 'Pages' ) }
											</ActionPanelFigureListItem>
											<ActionPanelFigureListItem>
												{ translate( 'Media' ) }
											</ActionPanelFigureListItem>
											<ActionPanelFigureListItem>
												{ translate( 'Domains' ) }
											</ActionPanelFigureListItem>
										</Fragment>
									) }
									{ purchasedPremiumThemes && purchasedPremiumThemes.length > 0 && (
										<ActionPanelFigureListItem>
											{ translate( 'Premium themes' ) }
										</ActionPanelFigureListItem>
									) }
									<ActionPanelFigureListItem>Gravatar</ActionPanelFigureListItem>
								</ActionPanelFigureList>
							</ActionPanelFigure>
						) }
						{ ! isLoading && hasCancelablePurchases && (
							<Fragment>
								<p className="account-close__body-copy">
									{ translate( 'You still have active purchases on your account.' ) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										"To delete your account, you'll need to cancel any active purchases " +
											'in {{a}}Manage Purchases{{/a}} before proceeding.',
										{
											components: {
												a: <ActionPanelLink href="/me/purchases" />,
											},
										}
									) }
								</p>
							</Fragment>
						) }
						{ ! isLoading && hasAtomicSites && ! hasCancelablePurchases && (
							<Fragment>
								<p className="account-close__body-copy">
									{ translate(
										'We are still in the process of removing one or more of your sites. This process normally takes 15-20 minutes. Once removal is completed, you should be able to close your account from this page.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate( 'To close this account now, {{a}}contact our support team{{/a}}.', {
										components: {
											a: <ActionPanelLink href="/help/contact" />,
										},
									} ) }
								</p>
							</Fragment>
						) }

						{ ( isLoading || isDeletePossible ) && (
							<Fragment>
								<p className="account-close__body-copy">
									<strong>
										{ translate(
											'Deleting your account will also delete all your sites and their content.'
										) }
									</strong>
								</p>
								{ purchasedPremiumThemes && purchasedPremiumThemes.length > 0 && (
									<Fragment>
										{ translate(
											'You will also lose access to the following premium themes you have purchased:'
										) }
										<ul className="account-close__theme-list">
											{ map( purchasedPremiumThemes, ( purchasedPremiumTheme ) => {
												return (
													<li key={ purchasedPremiumTheme.id }>
														{ purchasedPremiumTheme.productName }
													</li>
												);
											} ) }
										</ul>
									</Fragment>
								) }
								<p className="account-close__body-copy">
									{ translate(
										'You will not be able to open a new WordPress.com account using the same email address for 30 days.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										'You will not be able to log in to any other Automattic Services that use your WordPress.com account as a login. This includes WooCommerce.com, Crowdsignal.com, IntenseDebate.com, and Gravatar.com. Once your WordPress.com account is deleted, these services will also be deleted and you will lose access to any orders or support history you may have.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										'If you have any questions at all about what happens when you delete an account, ' +
											'please {{a}}contact someone from our support team{{/a}} first. ' +
											"They'll explain the ramifications and help you explore alternatives. ",
										{
											components: {
												a: <ActionPanelLink href="/help/contact" />,
											},
										}
									) }
								</p>
							</Fragment>
						) }
					</ActionPanelBody>
					<ActionPanelFooter>
						{ ( isLoading || isDeletePossible ) && (
							<Button scary onClick={ this.handleDeleteClick } data-testid="close-account-button">
								<Gridicon icon="trash" />
								{ translate( 'Delete account', { context: 'button label' } ) }
							</Button>
						) }
						{ hasAtomicSites && ! hasCancelablePurchases && (
							<Button primary href="/help/contact" data-testid="contact-support-button">
								{ translate( 'Contact support' ) }
							</Button>
						) }
						{ hasCancelablePurchases && (
							<Button primary href="/me/purchases" data-testid="manage-purchases-button">
								{ translate( 'Manage purchases', { context: 'button label' } ) }
							</Button>
						) }
					</ActionPanelFooter>
					<AccountCloseConfirmDialog
						isVisible={ this.state.showConfirmDialog }
						closeConfirmDialog={ this.closeConfirmDialog }
					/>
				</ActionPanel>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const purchasedPremiumThemes = getUserPurchasedPremiumThemes( state );
		const isLoading =
			! purchasedPremiumThemes ||
			! hasLoadedSites( state ) ||
			! hasLoadedUserPurchasesFromServer( state );

		return {
			isLoading,
			hasCancelablePurchases: hasCancelableUserPurchases( state ),
			purchasedPremiumThemes,
			hasAtomicSites: userHasAnyAtomicSites( state ),
			isAccountClosed: isAccountClosed( state ),
			sitesToBeDeleted: getAccountClosureSites( state ),
		};
	},
	{
		redirectToLogout,
	}
)( localize( AccountSettingsClose ) );
