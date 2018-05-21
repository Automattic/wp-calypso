/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

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
		const { translate, currentUserId, hasAtomicSites, hasPurchases } = this.props;
		const isDeletePossible = ! hasAtomicSites && ! hasPurchases;

		return (
			<div className="account-close main" role="main">
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
							<div>
								<p>
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
								<p>
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
							</div>
						) }
						{ hasAtomicSites && (
							<div>
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
							</div>
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
	const isLoading = ! hasLoadedSites( state ) || ! hasLoadedUserPurchasesFromServer( state );
	const purchases = getUserPurchases( state, currentUserId );

	return {
		currentUserId: user && user.ID,
		isLoading,
		hasPurchases: !! purchases,
		hasAtomicSites: userHasAnyAtomicSites( state ),
	};
} )( localize( AccountSettingsClose ) );
