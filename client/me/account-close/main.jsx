/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import page from 'page';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';

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
import Button from 'components/button';
import AccountCloseConfirmDialog from './confirm-dialog';
import QueryUserPurchases from 'components/data/query-user-purchases';
import QuerySites from 'components/data/query-sites';
import { getCurrentUser } from 'state/current-user/selectors';
import hasLoadedSites from 'state/selectors/has-loaded-sites';
import userHasAnyAtomicSites from 'state/selectors/user-has-any-atomic-sites';
import isAccountClosed from 'state/selectors/is-account-closed';
import { hasLoadedUserPurchasesFromServer, getUserPurchases } from 'state/purchases/selectors';
import userUtils from 'lib/user/utils';

class AccountSettingsClose extends Component {
	state = {
		showConfirmDialog: false,
	};

	componentWillReceiveProps = nextProps => {
		// If the account is closed, logout
		if ( nextProps.isAccountClosed === true ) {
			userUtils.logout();
		}
	};

	goBack = () => {
		page( '/me/account' );
	};

	handleDeleteClick = event => {
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

	render() {
		const { translate, currentUserId, hasAtomicSites, hasPurchases, isLoading } = this.props;
		const isDeletePossible = ! isLoading && ! hasAtomicSites && ! hasPurchases;
		const containerClasses = classnames( 'account-close', 'main', {
			'is-loading': isLoading,
		} );

		return (
			<div className={ containerClasses } role="main">
				{ currentUserId && <QueryUserPurchases userId={ currentUserId } /> }
				<QuerySites allSites />
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
									<ActionPanelFigureListItem>{ translate( 'Sites' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Posts' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Pages' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Media' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Domains' ) }</ActionPanelFigureListItem>
									<ActionPanelFigureListItem>{ translate( 'Gravatar' ) }</ActionPanelFigureListItem>
								</ActionPanelFigureList>
							</ActionPanelFigure>
						) }
						{ ! isLoading &&
							hasAtomicSites && (
								<Fragment>
									<p className="account-close__body-copy">
										{ translate(
											'Account closure cannot be undone and will remove all sites and content.'
										) }
									</p>
									<p className="account-close__body-copy">
										{ translate(
											'You will also be unable to open a new WordPress.com account with the same email address for 30 days.'
										) }
									</p>
									<p className="account-close__body-copy">
										{ translate(
											"To close your account, you'll need to {{a}}contact our support team{{/a}}.",
											{
												components: {
													a: <ActionPanelLink href="/help/contact" />,
												},
											}
										) }
									</p>
								</Fragment>
							) }
						{ ! isLoading &&
							hasPurchases &&
							! hasAtomicSites && (
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
										'Account closure cannot be undone and will remove all sites and content.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										'You will also be unable to open a new WordPress.com account with the same email address for 30 days.'
									) }
								</p>
								<p className="account-close__body-copy">
									{ translate(
										"If you're unsure about what account closure means or have any other questions, " +
											'{{a}}chat with someone from our support team{{/a}} before going ahead.',
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
							<Button scary onClick={ this.handleDeleteClick }>
								<Gridicon icon="trash" />
								{ translate( 'Close Account' ) }
							</Button>
						) }
						{ hasAtomicSites && (
							<Button primary href="/help/contact">
								{ translate( 'Contact Support' ) }
							</Button>
						) }
						{ hasPurchases &&
							! hasAtomicSites && (
								<Button primary href="/me/purchases">
									{ translate( 'Manage Purchases' ) }
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

export default connect( state => {
	const user = getCurrentUser( state );
	const currentUserId = user && user.ID;
	const purchases = getUserPurchases( state, currentUserId );
	const isLoading =
		! purchases || ! hasLoadedSites( state ) || ! hasLoadedUserPurchasesFromServer( state );

	return {
		currentUserId: user && user.ID,
		isLoading,
		hasPurchases: purchases && purchases.length > 0,
		hasAtomicSites: userHasAnyAtomicSites( state ),
		isAccountClosed: isAccountClosed( state ),
	};
} )( localize( AccountSettingsClose ) );
