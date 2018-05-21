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
import { hasLoadedUserPurchasesFromServer, getUserPurchases } from 'state/purchases/selectors';

class AccountSettingsClose extends Component {
	state = {
		showConfirmDialog: false,
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
								</ActionPanelFigureList>
							</ActionPanelFigure>
						) }
						{ ! hasAtomicSites && (
							<Fragment>
								<p class="account-close__body-copy">
									{ translate(
										'Account closure {{strong}}cannot{{/strong}} be undone, ' +
											'and will remove all sites and content.',
										{
											components: {
												strong: <strong />,
											},
										}
									) }
								</p>
								<p class="account-close__body-copy">
									{ translate(
										"If you're unsure about what account closure means or have any other questions, " +
											'please {{a}}chat with someone from our support team{{/a}} before proceeding.',
										{
											components: {
												a: <ActionPanelLink href="/help/contact" />,
											},
										}
									) }
								</p>
							</Fragment>
						) }
						{ hasAtomicSites && (
							<Fragment>
								<p>
									{ translate(
										"To close your account, you'll need to contact our support team. Account closure cannot be undone " +
											'and will remove all sites and content.'
									) }
								</p>
								<p>
									{ translate(
										"If you're unsure about what account closure means or have any other questions, " +
											"you'll have a chance to chat with someone from our support team before anything happens."
									) }
								</p>
							</Fragment>
						) }
					</ActionPanelBody>
					<ActionPanelFooter>
						{ isDeletePossible && (
							<Button scary onClick={ this.handleDeleteClick }>
								<Gridicon icon="trash" />
								{ translate( 'Close account' ) }
							</Button>
						) }
						{ ! isDeletePossible && (
							<Button primary href="/help/contact">
								{ translate( 'Contact support' ) }
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
		hasPurchases: !! purchases,
		hasAtomicSites: userHasAnyAtomicSites( state ),
	};
} )( localize( AccountSettingsClose ) );
