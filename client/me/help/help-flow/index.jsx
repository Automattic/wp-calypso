/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import classnames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Card from 'components/card';
import Dialog from 'components/dialog';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SiteSelector from 'components/site-selector';
import DocumentHead from 'components/data/document-head';
import MeSidebarNavigation from 'me/sidebar-navigation';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import userHasAnyAtomicSites from 'state/selectors/user-has-any-atomic-sites';
import { getCurrentUserSiteCount } from 'state/current-user/selectors';
import getJetpackSites from 'state/selectors/get-jetpack-sites';

/**
 * Style dependencies
 */
import './style.scss';

class HelpFlow extends Component {
	state = {
		displayDialog: false,
	};

	handleDialogClosure = () => {
		this.setState( {
			displayDialog: false,
			otherDialog: false,
			jetpackDialog: false,
		} );
	};

	handleJetpackButtonClick = () => {
		this.setState( { displayDialog: true, jetpackDialog: true } );
	};

	handleOtherClick = () => {
		this.setState( { displayDialog: true, otherDialog: true } );
	};

	siteFilter = site => {
		const isAtomic = get( site, 'options.is_automated_transfer', false );

		return site.jetpack && ! isAtomic;
	};

	backToHelp = () => {
		page( '/help' );
	};

	render() {
		const { siteCount, jetpackSiteCount, hasAtomicSites, translate } = this.props;

		const { displayDialog, jetpackDialog, otherDialog } = this.state;

		const hasWpComSites = siteCount - jetpackSiteCount > 0;

		if ( ! hasJetpackSites && ! hasAtomicSites ) {
			page( `/help/contact/form` );
		}

		const helpFlowClassNames = classnames( 'help-flow', {
			'has-site-selector': hasJetpackSites && hasWpComSites,
			'has-no-site-selector': ! hasWpComSites,
		} );

		const dialogClassNames = classnames( 'help-flow__dialog', {
			'is-other-screen': otherDialog,
			'is-jetpack-screen': jetpackDialog,
		} );

		let dialogContent;

		if ( jetpackDialog ) {
			dialogContent = (
				<p>
					{ translate(
						'For issues with the Jetpack plugin, contact the Jetpack support team directly or {{a}}take a look at the Jetpack support documentation{{/a}}.',
						{
							components: {
								a: <a href="https://jetpack.com/support/" />,
							},
						}
					) }
				</p>
			);
		} else if ( otherDialog ) {
			dialogContent = (
				<Fragment>
					<Accordion title={ translate( 'I have an issue with WooCommerce' ) }>
						{ translate(
							'For Store or WooCommerce questions, {{a}}contact the Woo support team directly{{/a}}.',
							{
								components: {
									a: <a href="https://woocommerce.com/contact-us/" />,
								},
							}
						) }
					</Accordion>

					<Accordion title={ translate( 'I have an issue with a custom theme/plugin' ) }>
						{ translate(
							'For issues with a custom theme or a custom plugin, contact that developer directly.'
						) }
					</Accordion>

					<Accordion title={ translate( 'I have an issue with the WordPress app' ) }>
						{ translate(
							'For issues with the WordPress apps, use the in-help support located under "Help & Support" to provide additional information necessary for debugging the issue.'
						) }
					</Accordion>

					<Accordion title={ translate( 'I have an issue WordAds' ) }>
						{ translate( 'For issues with WordAds, contact us {{a}}here{{/a}}.', {
							components: {
								a: <a href="/help/contact/form" />,
							},
						} ) }
					</Accordion>

					<Accordion title={ translate( 'I have a billing issue' ) }>
						{ translate(
							'For billing issues, including investigating an unknown charge, visit our {{a}}billing site{{/a}}.',
							{
								components: {
									a: <a href="https://wpchrg.wordpress.com/" />,
								},
							}
						) }
					</Accordion>

					<Accordion title={ translate( 'I have an issue with my dashboard on WordPress.com' ) }>
						{ translate(
							'For issues with your WordPress.com dashboard, contact us {{a}}here{{/a}}.',
							{
								components: {
									a: <a href="/help/contact/form" />,
								},
							}
						) }
					</Accordion>

					<Accordion
						title={ translate( 'I have an issue with a WordPress site hosted somewhere else' ) }
					>
						{ translate(
							'For help with the open source WordPress software, explore {{a}}self-hosted support{{/a}}, or contact your hosting provider directly.',
							{
								components: {
									a: <a href="https://wordpress.org/support//" />,
								},
							}
						) }
					</Accordion>
				</Fragment>
			);
		}

		return (
			<Main>
				<DocumentHead title={ translate( 'Help' ) } />
				<MeSidebarNavigation />
				<HeaderCake onClick={ this.backToHelp } isCompact>
					{ translate( 'Contact Us' ) }
				</HeaderCake>
				<Card className={ helpFlowClassNames }>
					<div className="help-flow__wrapper">
						<img
							className="help-flow__illustration"
							alt=""
							src="/calypso/images/illustrations/contact-us.svg"
						/>
						<div className="help-flow__description">
							<h2 className="help-flow__heading">{ translate( 'Hi there! How can we help?' ) }</h2>
							<p>
								{ translate(
									"Please select the service which you're having issues with, so you can be directed to the ideal place for support."
								) }
							</p>
							<p>
								{ translate(
									"If you're unsure of the service you require assistance with, click {{link}}here{{/link}}.",
									{
										components: {
											link: <a href="/help/contact/form" />,
										},
									}
								) }
							</p>
						</div>
					</div>
					<div className="help-flow__button-wrapper">
						{ hasWpComSites && (
							<Button className="help-flow__button is-wpcom" href="/help/contact/form">
								{ translate( 'My WordPress.com site' ) }
							</Button>
						) }
						{ hasJetpackSites && (
							<Button
								className="help-flow__button is-jetpack"
								primary
								onClick={ this.handleJetpackButtonClick }
							>
								{ translate( 'The Jetpack Plugin' ) }
							</Button>
						) }
						<Button className="help-flow__button is-link" onClick={ this.handleOtherClick }>
							{ translate( 'Other' ) }
						</Button>
					</div>
					{ hasJetpackSites && hasWpComSites && (
						<div className="help-flow__site-selector">
							<p className="help-flow__site-selector-subtitle">
								{ translate( 'Your Jetpack-connected sites:' ) }
							</p>
							<SiteSelector filter={ this.siteFilter } displaySearch={ false } />
						</div>
					) }
				</Card>

				{ displayDialog && (
					<Dialog isVisible additionalClassNames={ dialogClassNames }>
						<div className="help-flow__dialog-text">
							<h1 className="help-flow__dialog-heading">
								{ ! jetpackDialog
									? translate( 'How can we help?' )
									: translate( 'We think we could provide more help elsewhere…' ) }
							</h1>
							{ dialogContent }
						</div>
						<div className="help-flow__dialog-buttons">
							<Button className="help-flow__something-else-link is-link" href="/help/contact/form">
								{ ! jetpackDialog
									? translate(
											'Something else? Open a support request with WordPress.com, ' +
												"and if we can't help, we'll point you in the right direction for support."
									  )
									: translate(
											'Open a support request with WordPress.com anyway, ' +
												"and if we can't help, we'll point you in the right direction for support."
									  ) }
							</Button>
							<Button className="help-flow__close-dialog" onClick={ this.handleDialogClosure }>
								{ translate( 'Close' ) }
							</Button>
							{ jetpackDialog && (
								<Button primary onClick={ this.handleDialogClosure }>
									{ translate( 'Contact Jetpack Support' ) }
									<Gridicon icon="external" />
								</Button>
							) }
						</div>
					</Dialog>
				) }
			</Main>
		);
	}
}

export default connect( state => ( {
	hasJetpackSites: hasJetpackSites( state ),
	hasAtomicSites: userHasAnyAtomicSites( state ),
	siteCount: getCurrentUserSiteCount( state ),
	jetpackSiteCount: getJetpackSites( state ).length,
} ) )( localize( HelpFlow ) );
