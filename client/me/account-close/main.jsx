import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import page from 'page';
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
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
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
		const {
			translate,
			hasAtomicSites,
			hasCancelablePurchases,
			isLoading,
			purchasedPremiumThemes,
		} = this.props;
		const isDeletePossible = ! isLoading && ! hasAtomicSites && ! hasCancelablePurchases;
		const containerClasses = classnames( 'account-close', 'main', 'is-wide-layout', {
			'is-loading': isLoading,
			'is-hiding-other-sites': this.state.showSiteDropdown,
		} );

		return (
			<div className={ containerClasses } role="main">
				<QueryUserPurchases />
				<FormattedHeader brandFont headerText={ translate( 'Account Settings' ) } align="left" />

				<HeaderCake onClick={ this.goBack }>
					<h1>{ translate( 'Close account' ) }</h1>
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
										</Fragment>
									) }
									<ActionPanelFigureListItem>{ translate( 'Domains' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Gravatar' ) }</ActionPanelFigureListItem>
									{ purchasedPremiumThemes && purchasedPremiumThemes.length > 0 && (
										<ActionPanelFigureListItem>
											{ translate( 'Premium themes' ) }
										</ActionPanelFigureListItem>
									) }
								</ActionPanelFigureList>
							</ActionPanelFigure>
						) }
						{ ! isLoading && hasAtomicSites && (
							<Fragment>
								<p className="account-close__body-copy">
									{ translate(
										'Account closure cannot be undone. It will remove your account along with all your sites and all their content.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										'You will not be able to open a new WordPress.com account using the same email address for 30 days.'
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
						{ ! isLoading && hasCancelablePurchases && ! hasAtomicSites && (
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
						{ ( isLoading || isDeletePossible ) && (
							<Fragment>
								<p className="account-close__body-copy">
									{ translate(
										'Account closure cannot be undone. It will remove your account along with all your sites and all their content.'
									) }
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
										'You will not be able to log in to any other Automattic Services that use your WordPress.com account as a login. This includes WooCommerce.com, Crowdsignal.com, IntenseDebate.com and Gravatar.com. Once your WordPress.com account is closed, these services will also be closed and you will lose access to any orders or support history you may have.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										'If you have any questions at all about what happens when you close an account, ' +
											'please {{a}}chat with someone from our support team{{/a}} first. ' +
											"They'll explain the ramifications and help you explore alternatives. ",
										{
											components: {
												a: <ActionPanelLink href="/help/contact" />,
											},
										}
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate( 'When you\'re ready to proceed, use the "Close account" button.' ) }
								</p>
							</Fragment>
						) }
					</ActionPanelBody>
					<ActionPanelFooter>
						{ ( isLoading || isDeletePossible ) && (
							<Button scary onClick={ this.handleDeleteClick }>
								<Gridicon icon="trash" />
								{ translate( 'Close account', { context: 'button label' } ) }
							</Button>
						) }
						{ hasAtomicSites && (
							<Button primary href="/help/contact">
								{ translate( 'Contact support' ) }
							</Button>
						) }
						{ hasCancelablePurchases && ! hasAtomicSites && (
							<Button primary href="/me/purchases">
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
