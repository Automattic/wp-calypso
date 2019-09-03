/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import classnames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Dialog from 'components/dialog';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import SiteSelector from 'components/site-selector';
import SegmentedControl from 'components/segmented-control';
import DocumentHead from 'components/data/document-head';
import MeSidebarNavigation from 'me/sidebar-navigation';
import hasJetpackSites from 'state/selectors/has-jetpack-sites';
import userHasAnyAtomicSites from 'state/selectors/user-has-any-atomic-sites';
import { getCurrentUserSiteCount } from 'state/current-user/selectors';
import userHasAnyPaidPlans from 'state/selectors/user-has-any-paid-plans';
import getJetpackSites from 'state/selectors/get-jetpack-sites';

/**
 * Style dependencies
 */
import './style.scss';

class HelpFlow extends Component {
	state = {
		displayDialog: false,
	};

	handleDialogClosure = event => {
		this.setState( {
			displayDialog: false,
			blogIssueDialog: false,
			jetpackDialog: false,
			wooDialog: false,
		} );
	};

	handleJetpackButtonClick = event => {
		this.setState( { displayDialog: true, jetpackDialog: true } );
	};

	handleWooCommerceButtonClick = event => {
		this.setState( { displayDialog: true, wooDialog: true } );
	};

	handleBlogIssueButtonClick = event => {
		this.setState( { displayDialog: true, blogIssueDialog: true } );
	};

	siteFilter = site => {
		const isAtomic = get( site, 'options.is_automated_transfer', false );

		return site.jetpack && ! isAtomic;
	};

	backToHelp = () => {
		page( '/help' );
	};

	render() {
		const {
			siteCount,
			jetpackSiteCount,
			hasAtomicSites,
			hasJetpackSites,
			hasPaidPlans,
			translate,
		} = this.props;

		const { displayDialog, jetpackDialog, wooDialog, blogIssueDialog } = this.state;

		const hasWpComSites = siteCount - jetpackSiteCount > 0;

		if ( ! hasJetpackSites && ! hasAtomicSites ) {
			page( `/help/contact/form` );
		}

		const dialogClassNames = classnames( 'help-flow__dialog', {
			'has-site-selector': blogIssueDialog && hasJetpackSites && hasWpComSites,
		} );

		let dialogText;
		let buttonLink;
		let buttonText;

		if ( jetpackDialog ) {
			buttonLink = 'https://jetpack.com/contact-support/';
			buttonText = translate( 'Contact Jetpack support' );
			dialogText = translate(
				'Please contact the Jetpack support team directly for issues regarding the plugin, ' +
					'or explore the Jetpack support documentation.'
			);
		} else if ( wooDialog ) {
			buttonLink = 'https://woocommerce.com/contact-us/';
			buttonText = translate( 'Contact WooCommerce support' );
			dialogText = translate(
				'Please contact the WooCommerce support team directly for issues regarding the Store service or the plugin.'
			);
		} else if ( blogIssueDialog && ! hasWpComSites ) {
			buttonLink = 'https://wordpress.org/support/';
			buttonText = translate( 'Explore self-hosted site support' );
			dialogText = translate(
				"You don't have a site hosted at WordPress.com! " +
					"If you're having an issue with a particular theme or plugin, contact its developer. " +
					'Otherwise, explore the self-hosted forums for community help, or contact your hosting provider.'
			);
		} else if ( blogIssueDialog && hasWpComSites ) {
			buttonLink = 'https://wordpress.org/support/';
			buttonText = translate( 'Explore self-hosted site support' );
			dialogText = translate(
				'Are you experencing an issue with one of the sites listed? ' +
					'If so, as your site is not hosted on WordPress.com, you should instead visit the self-hosted forums, ' +
					'or alternatively contact your hosting provider.'
			);
		}

		return (
			<Main>
				<DocumentHead title={ translate( 'Help' ) } />
				<MeSidebarNavigation />
				<HeaderCake onClick={ this.backToHelp } isCompact>
					{ this.props.translate( 'Contact Us' ) }
				</HeaderCake>
				<Card className="help-flow">
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
						<Button className="help-flow__button" href="/help/contact/form">
							WordPress.com
						</Button>
						{ hasJetpackSites && (
							<Button className="help-flow__button" onClick={ this.handleJetpackButtonClick }>
								Jetpack
							</Button>
						) }
						{ hasPaidPlans && (
							<Button className="help-flow__button" href="/help/contact/form">
								WordAds
							</Button>
						) }
						{ ( hasJetpackSites || hasAtomicSites ) && (
							<Button className="help-flow__button" onClick={ this.handleWooCommerceButtonClick }>
								WooCommerce
							</Button>
						) }
						<Button className="help-flow__button" onClick={ this.handleBlogIssueButtonClick }>
							{ translate( 'An issue with my blog' ) }
						</Button>
					</div>
				</Card>

				{ displayDialog && (
					<Dialog isVisible additionalClassNames={ dialogClassNames }>
						<div className="help-flow__dialog-text">
							<h1 className="help-flow__dialog-heading">
								{ blogIssueDialog && hasWpComSites
									? translate( 'Which blog are you having issues with?' )
									: translate( 'We wish we could help more...' ) }
							</h1>
							<p>{ dialogText }</p>
						</div>
						<div className="help-flow__dialog-buttons">
							<Button className="help-flow__close-dialog" onClick={ this.handleDialogClosure }>
								{ translate( 'Close' ) }
							</Button>
							<Button primary href={ buttonLink }>
								<span>{ buttonText }</span>
								<Gridicon icon="external" />
							</Button>
							{ blogIssueDialog && hasWpComSites && (
								<Button className="help-flow__not-listed-button is-link" href="/help/contact/form">
									{ translate( "The site I'm having issues with isn't listed" ) }
								</Button>
							) }
						</div>
						{ hasJetpackSites && hasWpComSites && blogIssueDialog && (
							<SiteSelector filter={ this.siteFilter } displaySearch={ false } />
						) }
					</Dialog>
				) }
			</Main>
		);
	}
}

export default connect( state => ( {
	hasJetpackSites: hasJetpackSites( state ),
	hasAtomicSites: userHasAnyAtomicSites( state ),
	hasPaidPlans: userHasAnyPaidPlans( state ),
	siteCount: getCurrentUserSiteCount( state ),
	jetpackSiteCount: getJetpackSites( state ).length,
} ) )( localize( HelpFlow ) );
