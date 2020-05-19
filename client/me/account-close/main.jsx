/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import page from 'page';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelFigureHeader from 'components/action-panel/figure-header';
import ActionPanelFigureList from 'components/action-panel/figure-list';
import ActionPanelFigureListItem from 'components/action-panel/figure-list-item';
import ActionPanelLink from 'components/action-panel/link';
import ActionPanelFooter from 'components/action-panel/footer';
import { Button } from '@automattic/components';
import AccountCloseConfirmDialog from './confirm-dialog';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { getCurrentUser } from 'state/current-user/selectors';
import hasLoadedSites from 'state/selectors/has-loaded-sites';
import getAccountClosureSites from 'state/selectors/get-account-closure-sites';
import userHasAnyAtomicSites from 'state/selectors/user-has-any-atomic-sites';
import isAccountClosed from 'state/selectors/is-account-closed';
import { hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import hasCancelableUserPurchases from 'state/selectors/has-cancelable-user-purchases';
import getUserPurchasedPremiumThemes from 'state/selectors/get-user-purchased-premium-themes';
import userUtils from 'lib/user/utils';

/**
 * Style dependencies
 */
import './style.scss';

class AccountSettingsClose extends Component {
	state = {
		showConfirmDialog: false,
		showSiteDropdown: true,
	};

	UNSAFE_componentWillReceiveProps = ( nextProps ) => {
		// If the account is closed, logout
		if ( nextProps.isAccountClosed === true ) {
			userUtils.logout();
		}
	};

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
			currentUserId,
			hasAtomicSites,
			hasCancelablePurchases,
			isLoading,
			purchasedPremiumThemes,
		} = this.props;
		const isDeletePossible = ! isLoading && ! hasAtomicSites && ! hasCancelablePurchases;
		const containerClasses = classnames( 'account-close', 'main', {
			'is-loading': isLoading,
			'is-hiding-other-sites': this.state.showSiteDropdown,
		} );

		return (
			<div className={ containerClasses } role="main">
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				<HeaderCake onClick={ this.goBack }>
					<h1>{ translate( 'Close account' ) }</h1>
				</HeaderCake>
				<ActionPanel>
					<ActionPanelTitle className="account-close__heading">
						{ translate( 'Close account' ) }
					</ActionPanelTitle>
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

export default connect( ( state ) => {
	const user = getCurrentUser( state );
	const currentUserId = user && user.ID;
	const purchasedPremiumThemes = getUserPurchasedPremiumThemes( state, currentUserId );
	const isLoading =
		! purchasedPremiumThemes ||
		! hasLoadedSites( state ) ||
		! hasLoadedUserPurchasesFromServer( state );

	return {
		currentUserId: user && user.ID,
		isLoading,
		hasCancelablePurchases: hasCancelableUserPurchases( state, currentUserId ),
		purchasedPremiumThemes,
		hasAtomicSites: userHasAnyAtomicSites( state ),
		isAccountClosed: isAccountClosed( state ),
		sitesToBeDeleted: getAccountClosureSites( state ),
	};
} )( localize( AccountSettingsClose ) );
