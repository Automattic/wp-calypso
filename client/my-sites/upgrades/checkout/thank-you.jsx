/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect,
	store = require( 'store' );

/**
 * Internal dependencies
 */
var Button = require( 'components/button' ),
	config = require( 'config' ),
	Dispatcher = require( 'dispatcher' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	Card = require( 'components/card' ),
	Main = require( 'components/main' ),
	analytics = require( 'analytics' ),
	isPlan = require( 'lib/products-values' ).isPlan,
	{ getPrimaryDomain, isSubdomain } = require( 'lib/domains' ),
	refreshSitePlans = require( 'state/sites/plans/actions' ).refreshSitePlans,
	i18n = require( 'lib/mixins/i18n' ),
	PurchaseDetail = require( './purchase-detail' ),
	paths = require( 'my-sites/upgrades/paths' );

/**
 * Module variables
 */
var BusinessPlanDetails,
	ChargebackDetails,
	DomainMappingDetails,
	DomainRegistrationDetails,
	GenericDetails,
	GoogleAppsDetails,
	JetpackBusinessPlanDetails,
	JetpackPremiumPlanDetails,
	PremiumPlanDetails,
	SiteRedirectDetails;

var CheckoutThankYou = React.createClass( {
	statics: {
		setLastTransaction: function( transaction ) {
			if ( ! store.enabled ) {
				return;
			}

			store.set( 'CheckoutThankYou', { lastTransaction: transaction } );
		},

		getLastTransaction: function() {
			// This will return `null` if the store is empty *or* if the store is not
			// supported by the browser, such as in Safari's Private Browsing
			// mode.
			var data;

			if ( ! store.enabled ) {
				return null;
			}

			data = store.get( 'CheckoutThankYou' );
			if ( ! data ) {
				return null;
			}

			return data.lastTransaction;
		}
	},

	componentDidMount: function() {
		var lastTransaction = this.props.lastTransaction,
			selectedSite;

		if ( lastTransaction ) {
			selectedSite = lastTransaction.selectedSite;

			// Refresh selected site plans if the user just purchased a plan
			if ( cartItems.hasPlan( lastTransaction.cart ) ) {
				this.props.refreshSitePlans( selectedSite.ID );
			}

			// Refresh the list of sites to update the `site.plan` property
			// needed to display the plan name on the right of the `Plans` menu item
			Dispatcher.handleViewAction( {
				type: 'FETCH_SITES'
			} );
		}

		analytics.tracks.recordEvent( 'calypso_checkout_thank_you_view' );
	},

	thankYouHeader: function() {
		if ( this.cartHasFreeTrial() ) {
			return (
				<h1>
					{
						this.translate( 'Your 14 day free trial starts today!' )
					}
				</h1>
			);
		}
		return <h1>{ this.translate( 'Thank you for your purchase!' ) }</h1>
	},
	thankYouSubHeader: function() {
		var productName = this.getSingleProductName(),
			headerText;

		if ( this.cartHasFreeTrial() && productName ) {
			headerText = this.translate( 'We hope you enjoy %(productName)s. What\'s next? Take it for a spin!', {
				args: {
					productName: productName
				}
			} );
		} else if ( productName ) {
			headerText = this.translate( 'You will receive an email confirmation shortly for your purchase of ' +
				"%(productName)s. What's next?", {
					args: {
						productName: productName
					}
				}
			);
		} else {
			headerText = this.translate( 'You will receive an email confirmation shortly. What\'s next?' );
		}

		return <h2>{ headerText }</h2>
	},
	getSingleProductName() {
		var products;
		if ( cartItems ) {
			products = cartItems.getAll( this.props.lastTransaction.cart );
			if ( products.length === 1 ) {
				return products[ 0 ].product_name;
			}
		}
	},

	render: function() {
		return (
			<Main className="checkout-thank-you">
				<Card>
					<div className="thank-you-message">
						<span className="receipt-icon"></span>
						{ this.thankYouHeader() }
						{ this.thankYouSubHeader() }
					</div>
					{ this.productRelatedMessages() }
				</Card>

				<div className="get-support">
					<h3>{ this.translate( 'Questions? Need Help?' ) }</h3>
					{ this.supportRelatedMessages() }
				</div>
			</Main>
		);
	},

	cartHasFreeTrial: function() {
		return cartItems.hasFreeTrial( this.props.lastTransaction.cart );
	},

	cartHasJetpackPlan: function() {
		return ( cartItems.hasProduct( this.props.lastTransaction.cart, 'jetpack_premium' ) || cartItems.hasProduct( this.props.lastTransaction.cart, 'jetpack_business' ) );
	},

	takeItForASpin: function() {
		return (
			<h3>
				{ this.translate( 'Take it for a spin!', {
					context: 'Upgrades: Header on thank you screen after successful upgrade trial activation.',
					comment: 'It = Premium or Business plan'
				} ) }
			</h3>
		);
	},

	premiumFreeTrialMessage: function() {
		if ( this.cartHasFreeTrial() ) {
			return (
				<div className="try-out-message">
					<p>
						{ this.translate( 'You have %(days)d days to try out all of the WordPress.com Premium features:', {
							args: { days: 14 },
							context: 'Upgrades: Description on thank you screen after successful upgrade trial activation',
							comment: '"%(days)d" = 14'
						} ) }
					</p>
				</div>
			);
		}
	},

	businessFreeTrialMessage: function() {
		if ( this.cartHasFreeTrial() ) {
			return (
				<div className="try-out-message">
					<p>
						{ this.translate( 'You have %(days)d days to try out all of the WordPress.com Business features:', {
							args: { days: 14 },
							context: 'Upgrades: Description on thank you screen after successful upgrade trial activation',
							comment: '"%(days)d" = 14'
						} ) }
					</p>
				</div>
			);
		}
	},

	productRelatedMessages: function() {
		var cart = this.props.lastTransaction.cart,
			selectedSite = this.props.lastTransaction.selectedSite,
			componentClass,
			domain;

		if ( cartItems.hasProduct( cart, 'value_bundle' ) ) {
			componentClass = PremiumPlanDetails;
		} else if ( cartItems.hasProduct( cart, 'business-bundle' ) ) {
			componentClass = BusinessPlanDetails;
		} else if ( cartItems.hasProduct( cart, 'jetpack_premium' ) ) {
			componentClass = JetpackPremiumPlanDetails;
		} else if ( cartItems.hasProduct( cart, 'jetpack_business' ) ) {
			componentClass = JetpackBusinessPlanDetails;
		} else if ( cartItems.hasProduct( cart, 'gapps' ) || cartItems.hasProduct( cart, 'gapps_extra_license' ) ) {
			domain = cartItems.getGoogleApps( cart )[ 0 ].meta;

			componentClass = GoogleAppsDetails;
		} else if ( cartItems.hasDomainRegistration( cart ) ) {
			domain = cartItems.getDomainRegistrations( cart )[ 0 ].meta;

			componentClass = DomainRegistrationDetails;
		} else if ( cartItems.hasProduct( cart, 'domain_map' ) ) {
			domain = cartItems.getDomainMappings( cart )[ 0 ].meta;

			componentClass = DomainMappingDetails;
		} else if ( cartItems.hasProduct( cart, 'offsite_redirect' ) ) {
			domain = cartItems.getSiteRedirects( cart )[ 0 ].meta;

			componentClass = SiteRedirectDetails;
		} else if ( cartItems.hasProduct( cart, 'chargeback' ) ) {
			componentClass = ChargebackDetails;
		} else {
			componentClass = GenericDetails;
		}

		return (
			<div>
				{ React.createElement( componentClass, {
					selectedSite: selectedSite,
					isFreeTrial: this.cartHasFreeTrial(),
					locale: i18n.getLocaleSlug(),
					domain: domain
				} ) }
			</div>
		);
	},

	supportRelatedMessages: function() {
		var localeSlug = i18n.getLocaleSlug();

		if ( this.cartHasJetpackPlan() ) {
			return (
				<p>
					{ this.translate(
						'Check out our {{supportDocsLink}}support docs{{/supportDocsLink}} ' +
						'or {{contactLink}}contact us{{/contactLink}}.',
						{
							components: {
								supportDocsLink: <a href={ 'http://jetpack.me/support/' } target="_blank" />,
								contactLink: <a href={ 'http://jetpack.me/contact-support/' } target="_blank" />
							}
						}
					) }
				</p>
			);
		}

		return (
			<p>
				{ this.translate(
					'Check out our {{supportDocsLink}}support docs{{/supportDocsLink}}, ' +
					'search for tips and tricks in {{forumLink}}the forum{{/forumLink}}, ' +
					'or {{contactLink}}contact us{{/contactLink}}.',
					{
						components: {
							supportDocsLink: <a href={ 'http://' + localeSlug + '.support.wordpress.com' } target="_blank" />,
							forumLink: <a href={ 'http://' + localeSlug + '.forums.wordpress.com' } target="_blank" />,
							contactLink: <a href={ '/help/contact' } />
						}
					}
				) }
			</p>
		);
	}
} );

PremiumPlanDetails = React.createClass( {
	render: function() {
		var adminUrl = this.props.selectedSite.URL + '/wp-admin/',
			customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + this.props.selectedSite.slug : adminUrl + 'customize.php?return=' + encodeURIComponent( window.location.href ),
			showGetFreeDomainTip = ! this.props.isFreeTrial;

		return (
			<ul className="purchase-details-list">
				{ showGetFreeDomainTip
				? <PurchaseDetail
						additionalClass="get-free-domain"
						title={ this.translate( 'Get a free domain' ) }
						description={ this.translate( 'WordPress.com Premium includes a free domain for your site.' ) }
						buttonText={ this.translate( 'Add Free Domain' ) }
						onButtonClick={ goToExternalPage( '/domains/add/' + this.props.selectedSite.slug ) } />
					: null
				}

				{ ! showGetFreeDomainTip
				? <PurchaseDetail
						additionalClass="ads-have-been-removed"
						title={ this.translate( 'Ads have been removed!' ) }
						description={ this.translate( 'WordPress.com ads will not show up on your blog.' ) }
						buttonText={ this.translate( 'View Your Site' ) }
						onButtonClick={ goToExternalPage( this.props.selectedSite.URL ) } />
					: null
				}

				<PurchaseDetail
					additionalClass="customize-fonts-and-colors"
					title={ this.translate( 'Customize Fonts & Colors' ) }
					description={ this.translate( 'You now have access to full font and CSS editing capabilites.' ) }
					buttonText={ this.translate( 'Customize Your Site' ) }
					onButtonClick={ goToExternalPage( customizeLink ) } />

				<PurchaseDetail
					additionalClass="upload-to-videopress"
					title={ this.translate( 'Upload to VideoPress' ) }
					description={ this.translate( "Uploading videos to your blog couldn't be easier." ) }
					buttonText={ this.translate( 'Start Using VideoPress' ) }
					onButtonClick={ goToExternalPage( this.props.selectedSite.URL + '/wp-admin/media-new.php' ) } />
			</ul>
		);
	}
} );

JetpackPremiumPlanDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="akismet"
					title={ this.translate( 'Akismet' ) }
					description={ this.translate( 'Say goodbye to comment spam' ) }
					buttonText={ this.translate( 'Start using Akismet' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/setting-up-premium-services/' ) } />

				<PurchaseDetail
					additionalClass="vaultpress"
					title={ this.translate( 'VaultPress' ) }
					description={ this.translate( 'Backup your site' ) }
					buttonText={ this.translate( 'Start using VaultPress' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/setting-up-premium-services/' ) } />
			</ul>
		);
	}
} );

BusinessPlanDetails = React.createClass( {
	render: function() {
		var showGetFreeDomainTip = ! this.props.isFreeTrial;

		return (
			<ul className="purchase-details-list">
				{ showGetFreeDomainTip
				? <PurchaseDetail
						additionalClass="get-free-domain"
						title={ this.translate( 'Get a free domain' ) }
						description={ this.translate( 'WordPress.com Business includes a free domain for your site.' ) }
						buttonText={ this.translate( 'Add Free Domain' ) }
						onButtonClick={ goToExternalPage( '/domains/add/' + this.props.selectedSite.slug ) } />
					: null }

				<PurchaseDetail
					additionalClass="ecommerce"
					title={ this.translate( 'Add eCommerce' ) }
					description={ this.translate( 'Connect your Ecwid or Shopify store with your WordPress.com site.' ) }
					buttonText={ this.translate( 'Set Up eCommerce' ) }
					onButtonClick={ goToExternalPage( '/plugins/' + this.props.selectedSite.slug ) } />

				{ ! showGetFreeDomainTip
				? <PurchaseDetail
						additionalClass="live-chat"
						title={ this.translate( 'Start a Live Chat' ) }
						description={ this.translate( 'Have a question? Chat live with WordPress.com Happiness Engineers.' ) }
						buttonText={ this.translate( 'Talk to an Operator' ) }
						onButtonClick={ goToExternalPage( '//support.wordpress.com/live-chat/' ) } />
					: null
				}

				<PurchaseDetail
					additionalClass="unlimited-premium-themes"
					title={ this.translate( 'Browse Themes' ) }
					description={ this.translate( 'Browse our collection of beautiful and amazing themes for your site.' ) }
					buttonText={ this.translate( 'Find a New Theme' ) }
					onButtonClick={ goToExternalPage( '/themes/' + this.props.selectedSite.slug ) } />
			</ul>
		);
	}
} );

JetpackBusinessPlanDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="akismet"
					title={ this.translate( 'Akismet' ) }
					description={ this.translate( 'Say goodbye to comment spam' ) }
					buttonText={ this.translate( 'Start using Akismet' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/setting-up-premium-services/' ) } />

				<PurchaseDetail
					additionalClass="vaultpress"
					title={ this.translate( 'VaultPress' ) }
					description={ this.translate( 'Backup your site' ) }
					buttonText={ this.translate( 'Start using VaultPress' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/setting-up-premium-services/' ) } />

				<PurchaseDetail
					additionalClass="polldaddy"
					title={ this.translate( 'PollDaddy' ) }
					description={ this.translate( 'Create surveys and polls' ) }
					buttonText={ this.translate( 'Start using PollDaddy' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/setting-up-premium-services/' ) } />
			</ul>
		);
	}
} );

DomainMappingDetails = React.createClass( {
	getInitialState: function() {
		return {
			primaryDomain: null
		};
	},

	componentWillMount: function() {
		getPrimaryDomain( this.props.selectedSite.ID, function( error, data ) {
			if ( ! error && data ) {
				this.setState( { primaryDomain: data.domain } );
			}
		}.bind( this ) );
	},

	render: function() {
		var primaryDomainDescription,
			supportDoc;

		if ( isSubdomain( this.props.domain ) ) {
			supportDoc = 'https://' + this.props.locale + '.support.wordpress.com/domains/map-subdomain/';
		} else {
			supportDoc = 'https://' + this.props.locale + '.support.wordpress.com/domains/map-existing-domain/';
		}

		if ( this.state.primaryDomain === this.props.domain ) {
			primaryDomainDescription = this.translate( '%(domain)s is your primary domain. Do you want to change it?', { args: { domain: this.props.domain } } );
		} else {
			primaryDomainDescription = this.translate( 'Want this to be your primary domain for this site?' );
		}

		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="important"
					title={ this.translate( 'Important!' ) }
					description={ this.translate( "Your domain mapping won't work until you update the DNS settings." ) }
					buttonText={ this.translate( 'Learn More' ) }
					onButtonClick={ goToExternalPage( supportDoc ) } />

				<PurchaseDetail
					additionalClass="your-primary-domain"
					title={ this.translate( 'Your Primary Domain' ) }
					description={ primaryDomainDescription }
					buttonText={ this.translate( 'Update Settings' ) }
					onButtonClick={ goToDomainManagement( this.props.selectedSite, this.props.domain ) } />

				{ ! isPlan( this.props.selectedSite.plan ) ? <PurchaseDetail
					additionalClass="upgrade-now"
					title={ this.translate( 'Upgrade Now' ) }
					description={ this.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
					buttonText={ this.translate( 'View Plans' ) }
					onButtonClick={ goToExternalPage( '/plans/' + this.props.selectedSite.slug ) } /> : null }
			</ul>
		);
	}
} );

DomainRegistrationDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="important"
					title={ this.translate( 'Important!' ) }
					description={ this.translate( 'It can take up to 72 hours for your domain setup to complete.' ) }
					buttonText={ this.translate( 'Learn More' ) }
					onButtonClick={ goToExternalPage( '//support.wordpress.com/domains/' ) } />

				<PurchaseDetail
					additionalClass="your-primary-domain"
					title={ this.translate( 'Your Primary Domain' ) }
					description={ this.translate( 'Want this to be your primary domain for this site?' ) }
					buttonText={ this.translate( 'Update Settings' ) }
					onButtonClick={ goToDomainManagement( this.props.selectedSite, this.props.domain ) } />

				{ ! isPlan( this.props.selectedSite.plan ) ? <PurchaseDetail
					additionalClass="upgrade-now"
					title={ this.translate( 'Upgrade Now' ) }
					description={ this.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
					buttonText={ this.translate( 'View Plans' ) }
					onButtonClick={ goToExternalPage( '/plans/' + this.props.selectedSite.slug ) } /> : null }
			</ul>
		);
	}
} );

GoogleAppsDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="google-apps-details"
					title={ this.translate( 'Google Apps Setup' ) }
					description={ this.translate( 'You will receive an email shortly with your login information.' ) }
					buttonText={ this.translate( 'More about Google Apps' ) }
					onButtonClick={ goToExternalPage( 'https://en.support.wordpress.com/add-email/adding-google-apps-to-your-site/' ) } />

				<PurchaseDetail
					additionalClass="important"
					title={ this.translate( 'Important!' ) }
					description={ this.translate( 'It can take up to 72 hours for your domain setup to complete.' ) }
					buttonText={ this.translate( 'Learn More' ) }
					onButtonClick={ goToExternalPage( '//support.wordpress.com/domains/' ) } />

				<PurchaseDetail
					additionalClass="your-primary-domain"
					title={ this.translate( 'Your Primary Domain' ) }
					description={ this.translate( 'Want this to be your primary domain for this site?' ) }
					buttonText={ this.translate( 'Update Settings' ) }
					onButtonClick={ goToDomainManagement( this.props.selectedSite, this.props.domain ) } />
			</ul>
		);
	}
} );

SiteRedirectDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="redirect-now-working"
					title={ this.translate( 'Redirect now working' ) }
					description={ this.translate( 'Visitors to your site will be redirected to your chosen target.' ) }
					buttonText={ this.translate( 'Test Redirect' ) }
					onButtonClick={ goToExternalPage( this.props.selectedSite.URL ) } />

				<PurchaseDetail
					additionalClass="change-redirect-settings"
					title={ this.translate( 'Change redirect settings' ) }
					description={ this.translate( 'You can disable the redirect or change the target at any time.' ) }
					buttonText={ this.translate( 'My Domains' ) }
					onButtonClick={ goToDomainManagement( this.props.selectedSite ) } />
			</ul>
		);
	}
} );

ChargebackDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<PurchaseDetail
					additionalClass="important"
					title={ this.translate( 'Important!' ) }
					description={ this.translate( 'The chargeback fee has been paid and you can now use the full features of your site.' ) }
					buttonText={ this.translate( 'Write a Post' ) }
					onButtonClick={ goToExternalPage( '/post/' + this.props.selectedSite.slug ) } />

				{ ! isPlan( this.props.selectedSite.plan ) ? <PurchaseDetail
					additionalClass="upgrade-now"
					title={ this.translate( 'Upgrade Now' ) }
					description={ this.translate( 'Take your blog to the next level by upgrading to one of our plans.' ) }
					buttonText={ this.translate( 'View Plans' ) }
					onButtonClick={ goToExternalPage( '/plans/' + this.props.selectedSite.slug ) } /> : null }
			</ul>
		);
	}
} );

GenericDetails = React.createClass( {
	render: function() {
		return (
			<ul className="purchase-details-list">
				<Button href={ this.props.selectedSite.URL } primary>
					{ this.translate( 'Back to my site' ) }
				</Button>
			</ul>
		);
	}
} );

function goToExternalPage( url ) {
	return function( event ) {
		event.preventDefault();

		window.open( url );
	};
}

function goToDomainManagement( selectedSite, domain ) {
	let url;

	if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
		if ( domain ) {
			url = paths.domainManagementEdit( selectedSite.domain, domain );
		} else {
			url = paths.domainManagementList( selectedSite.domain );
		}
	} else {
		url = '/my-domains/' + selectedSite.ID;
	}

	return goToExternalPage( url );
}

module.exports = connect(
	undefined,
	function mapDispatchToProps( dispatch ) {
		return {
			refreshSitePlans( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
			}
		};
	}
)( CheckoutThankYou );
