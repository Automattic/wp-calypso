/**
 * External Dependencies
 */
var page = require( 'page' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var analytics = require( 'analytics' ),
	sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	ThemeActions = require( 'lib/themes/flux-actions' ),
	Main = require( 'components/main' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	titleActions = require( 'lib/screen-title/actions' ),
	productsList = require( 'lib/products-list' )();

module.exports = {

	domainSearchIndex: function() {
		page.redirect( '/domains/add' + ( sites.getSelectedSite() ? ( '/' + sites.getSelectedSite().slug ) : '' ) );
	},

	domainsAddHeader: function( context, next ) {
		context.getSiteSelectionHeaderText = function() {
			return i18n.translate( 'Select a site to add a domain' );
		};

		next();
	},

	domainsAddRedirectHeader: function( context, next ) {
		context.getSiteSelectionHeaderText = function() {
			return i18n.translate( 'Select a site to add Site Redirect' );
		};

		next();
	},

	domainSearch: function( context ) {
		var CartData = require( 'components/data/cart' ),
			DomainSearch = require( './domain-search' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Domain Search' ), {
			siteID: context.params.domain
		} );

		analytics.pageView.record( basePath, 'Domain Search > Domain Registration' );

		ReactDom.render(
			(
				<CartData>
					<DomainSearch
						basePath={ basePath }
						context={ context }
						sites={ sites }
						productsList={ productsList } />
				</CartData>
			),
			document.getElementById( 'primary' )
		);
	},

	siteRedirect: function( context ) {
		var CartData = require( 'components/data/cart' ),
			SiteRedirect = require( './domain-search/site-redirect' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Redirect a Site' ), {
			siteID: context.params.domain
		} );

		analytics.pageView.record( basePath, 'Domain Search > Site Redirect' );

		ReactDom.render(
			(
				<CartData>
					<SiteRedirect
						productsList={ productsList }
						sites={ sites } />
				</CartData>
			),
			document.getElementById( 'primary' )
		);
	},

	mapDomain: function( context ) {
		var CartData = require( 'components/data/cart' ),
			MapDomain = require( 'components/domains/map-domain' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle( i18n.translate( 'Map a Domain' ), {
			siteID: context.params.domain
		} );

		analytics.pageView.record( basePath, 'Domain Search > Domain Mapping' );

		ReactDom.render(
			(
				<Main>
					<CartData>
						<MapDomain
							productsList={ productsList }
							sites={ sites } />
					</CartData>
				</Main>
			),
			document.getElementById( 'primary' )
		);
	},

	googleAppsWithRegistration: function( context ) {
		var CartData = require( 'components/data/cart' ),
			GoogleApps = require( 'components/upgrades/google-apps' ),
			basePath = route.sectionify( context.path );

		titleActions.setTitle(
			i18n.translate( 'Register %(domain)s', {
				args: { domain: context.params.registerDomain }
			} ),
			{
				siteID: context.params.domain
			}
		);

		const handleAddGoogleApps = function( googleAppsCartItem ) {
			upgradesActions.addItem( googleAppsCartItem );
			page( '/checkout/' + sites.getSelectedSite().slug );
		};

		const handleGoBack = function() {
			page( '/domains/add/' + sites.getSelectedSite().slug );
		};

		const handleClickSkip = function() {
			page( '/checkout/' + sites.getSelectedSite().slug );
		};

		analytics.pageView.record( basePath, 'Domain Search > Domain Registration > Google Apps' );

		ReactDom.render(
			(
				<Main>
					<CartData>
						<GoogleApps
							productsList={ productsList }
							domain={ context.params.registerDomain }
							onGoBack={ handleGoBack }
							onAddGoogleApps={ handleAddGoogleApps }
							onClickSkip={ handleClickSkip } />
					</CartData>
				</Main>
			),
			document.getElementById( 'primary' )
		);
	},

	checkout: function( context ) {
		var Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' ),
			storedCards = require( 'lib/stored-cards' )(),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Checkout' );

		titleActions.setTitle( i18n.translate( 'Checkout' ), {
			siteID: context.params.domain
		} );

		ReactDom.render(
			(
				<CheckoutData>
					<Checkout
						cards={ storedCards }
						productsList={ productsList }
						sites={ sites } />
				</CheckoutData>
			),
			document.getElementById( 'primary' )
		);

		ReactDom.render(
			(
				<CartData>
					<SecondaryCart selectedSite={ sites.getSelectedSite() } />
				</CartData>
			),
			document.getElementById( 'secondary' )
		);
	},

	checkoutThankYou: function( context ) {
		var CheckoutThankYouComponent = require( './checkout/thank-you' ),
			lastTransaction = CheckoutThankYouComponent.getLastTransaction(),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Checkout Thank You' );
		context.layout.setState( { noSidebar: true } );

		if ( ! lastTransaction ) {
			page.redirect( '/plans' );

			return;
		}

		titleActions.setTitle( i18n.translate( 'Thank You' ) );

		ReactDom.render(
			React.createElement( CheckoutThankYouComponent, {
				lastTransaction: lastTransaction,
				productsList: productsList
			} ),
			document.getElementById( 'primary' )
		);

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		CheckoutThankYouComponent.setLastTransaction( null );
	},

	redirectIfNoSite: function( redirectTo ) {
		return function( context, next ) {
			var selectedSite = sites.getSelectedSite();

			if ( ! selectedSite || ! selectedSite.isUpgradeable() ) {
				return page.redirect( redirectTo );
			}

			next();
		};
	},

	redirectIfThemePurchased: function( context, next ) {
		var CheckoutThankYouComponent = require( './checkout/thank-you' ),
			cartItems = require( 'lib/cart-values' ).cartItems,
			lastTransaction = CheckoutThankYouComponent.getLastTransaction(),
			selectedSite = lastTransaction.selectedSite,
			cart = lastTransaction.cart,
			cartAllItems = cartItems.getAll( cart );

		if ( cartItems.hasOnlyProductsOf( cart, 'premium_theme' ) ) {
			const { meta, extra: { source } } = cartAllItems[ 0 ];
			ThemeActions.activated( meta, selectedSite, source, true );
			page.redirect( '/design/' + selectedSite.slug );
			return;
		}

		next();
	}
};
