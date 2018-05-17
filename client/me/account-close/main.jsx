/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelFooter from 'components/action-panel/footer';
import Button from 'components/button';

class AccountSettingsClose extends Component {
	goBack = () => {
		page( '/me/account' );
	};

	handleDeleteClick = event => {
		event.preventDefault();
	};

	render() {
		const { translate } = this.props;
		const hasAtomicSites = false;

		return (
			<div className="account-close" role="main">
				<HeaderCake onClick={ this.goBack }>
					<h1>{ translate( 'Close account' ) }</h1>
				</HeaderCake>
				<ActionPanel>
					<ActionPanelTitle className="account-close__heading">
						{ translate( 'Close account' ) }
					</ActionPanelTitle>
					<ActionPanelBody>
						<ActionPanelFigure>
							<h3>{ translate( 'These items will be deleted' ) }</h3>
							<ul>
								<li>{ translate( 'Posts' ) }</li>
								<li>{ translate( 'Pages' ) }</li>
								<li>{ translate( 'Media' ) }</li>
								<li>{ translate( 'Users & Authors' ) }</li>
								<li>{ translate( 'Domains' ) }</li>
							</ul>
						</ActionPanelFigure>
						{ ! hasAtomicSites && (
							<div>
								<p>
									{ translate(
										'Account closure {{strong}}cannot{{/strong}} be undone, ' +
											'and will remove all content, contributors and domains from your account.',
										{
											components: {
												strong: <strong />,
											},
										}
									) }
								</p>
								<p>
									{ translate(
										"If you're unsure about what deletion means or have any other questions, " +
											'please chat with someone from our support team before proceeding.'
									) }
								</p>
								<p>
									<a href="/help/contact">{ translate( 'Contact support' ) }</a>
								</p>
							</div>
						) }
						{ hasAtomicSites && (
							<div>
								<p>
									{ translate(
										"To close your account, you'll need to contact our support team. Account closure cannot be undone, " +
											'and will remove all content, contributors and domains from this site.'
									) }
								</p>
								<p>
									{ translate(
										"If you're unsure about what deletion means or have any other questions, " +
											"you'll have a chance to chat with someone from our support team before anything happens."
									) }
								</p>
							</div>
						) }
					</ActionPanelBody>
					<ActionPanelFooter>
						{ ! hasAtomicSites && (
							<Button scary disabled={ true } onClick={ this.handleDeleteClick }>
								<Gridicon icon="trash" />
								{ translate( 'Close account' ) }
							</Button>
						) }
						{ hasAtomicSites && (
							<Button primary href="/help/contact">
								{ translate( 'Contact support' ) }
							</Button>
						) }
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	}
}

export default localize( AccountSettingsClose );
