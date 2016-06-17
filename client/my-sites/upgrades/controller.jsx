/**
 * External Dependencies
 */
var page = require( 'page' ),
	i18n = require( 'i18n-calypso' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' );

/**
 * Internal Dependencies
 */
var analytics = require( 'lib/analytics' ),
	sites = require( 'lib/sites-list' )(),
	route = require( 'lib/route' ),
	Main = require( 'components/main' ),
	upgradesActions = require( 'lib/upgrades/actions' ),
	titleActions = require( 'lib/screen-title/actions' ),
	setSection = require( 'state/ui/actions' ).setSection,
	plansList = require( 'lib/plans-list' )(),
	productsList = require( 'lib/products-list' )(),
	abtest = require( 'lib/abtest' ).abtest,
	renderWithReduxStore = require( 'lib/react-helpers' ).renderWithReduxStore;

module.exports = {

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

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			(
				<CartData>
					<DomainSearch
						basePath={ basePath }
						context={ context }
						sites={ sites }
						productsList={ productsList } />
				</CartData>
			),
			document.getElementById( 'primary' ),
			context.store
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

		renderWithReduxStore(
			(
				<CartData>
					<SiteRedirect
						productsList={ productsList }
						sites={ sites } />
				</CartData>
			),
			document.getElementById( 'primary' ),
			context.store
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
		renderWithReduxStore(
			(
				<Main>
					<CartData>
						<MapDomain
							withPlansOnly={ abtest( 'domainsWithPlansOnly' ) === 'plansOnly' }
							store={ context.store }
							productsList={ productsList }
							initialQuery={ context.query.initialQuery }
							sites={ sites } />
					</CartData>
				</Main>
			),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	googleAppsWithRegistration: function( context ) {
		var CartData = require( 'components/data/cart' ),
			GoogleApps = require( 'components/upgrades/google-apps' );

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

		analytics.pageView.record( '/domains/add/:site/google-apps', 'Domain Search > Domain Registration > Google Apps' );

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
			basePath = route.sectionify( context.path ),
			product = context.params.product,
			selectedFeature = context.params.feature;

		if ( 'thank-you' === product ) {
			return;
		}

		analytics.pageView.record( basePath, 'Checkout' );

		titleActions.setTitle( i18n.translate( 'Checkout' ), {
			siteID: context.params.domain
		} );

		renderWithReduxStore(
			(
				<CheckoutData>
					<Checkout
						cards={ storedCards }
						product={ product }
						plans={ plansList }
						productsList={ productsList }
						selectedFeature={ selectedFeature }
						sites={ sites } />
				</CheckoutData>
			),
			document.getElementById( 'primary' ),
			context.store
		);

		renderWithReduxStore(
			(
				<CartData>
					<SecondaryCart selectedSite={ sites.getSelectedSite() } />
				</CartData>
			),
			document.getElementById( 'secondary' ),
			context.store
		);
	},

	checkoutThankYou: function( context ) {
		var CheckoutThankYouComponent = require( './checkout-thank-you' ),
			basePath = route.sectionify( context.path ),
			receiptId = Number( context.params.receiptId );

		analytics.pageView.record( basePath, 'Checkout Thank You' );

		context.store.dispatch( setSection( 'checkout-thank-you', { hasSidebar: false } ) );

		titleActions.setTitle( i18n.translate( 'Thank You' ) );

		renderWithReduxStore(
			(
				<CheckoutThankYouComponent
					productsList={ productsList }
					receiptId={ receiptId }
					selectedFeature={ context.params.feature }
					selectedSite={ sites.getSelectedSite() } />
			),
			document.getElementById( 'primary' ),
			context.store
		);

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	},

	redirectIfNoSite: function( redirectTo ) {
		return function( context, next ) {
			var selectedSite = sites.getSelectedSite();

			if ( ! selectedSite || ! selectedSite.isUpgradeable() ) {
				return page.redirect( redirectTo );
			}

			next();
		};
	}
};
