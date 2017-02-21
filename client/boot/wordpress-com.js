
function misc() {
	// When the user is bootstrapped, we also bootstrap the
	// locale strings
	if ( ! config( 'wpcom_user_bootstrap' ) ) {
		localeSlug = user.get().localeSlug;
		if ( localeSlug ) {
			switchLocale( localeSlug );
		}
	}
	// Set the locale for the current user
	user.on( 'change', function() {
		localeSlug = user.get().localeSlug;
		if ( localeSlug ) {
			switchLocale( localeSlug );
		}
	} );

	translatorJumpstart.init();
}

function renderLayout( reduxStore ) {
	const Layout = require( 'controller' ).ReduxWrappedLayout;

	const layoutElement = React.createElement( Layout, {
		store: reduxStore
	} );

	ReactDom.render(
		layoutElement,
		document.getElementById( 'wpcom' )
	);

	debug( 'Main layout rendered.' );
}
