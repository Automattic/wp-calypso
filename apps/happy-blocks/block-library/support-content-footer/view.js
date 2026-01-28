import './style.scss';

document.addEventListener( 'DOMContentLoaded', function () {
	const helpCenterLinks = document.querySelectorAll(
		'.happy-blocks-new-support-content-footer.contact-page a[data-track-destination="help_center"], .happy-blocks-new-support-content-footer a[data-track-destination="contact_form"]'
	);

	if ( ! helpCenterLinks.length ) {
		return;
	}

	helpCenterLinks.forEach( ( link ) =>
		link.addEventListener( 'click', function ( e ) {
			if ( window.helpCenter?.loadHelpCenter ) {
				e.preventDefault();

				window.helpCenter.loadHelpCenter().then( () => {
					if ( window.wp?.data?.dispatch ) {
						const helpCenterDispatch = window.wp.data.dispatch( 'automattic/help-center' );
						helpCenterDispatch.setNavigateToRoute( '/odie' );
						helpCenterDispatch.setShowHelpCenter( true );
					}
				} );
			}
		} )
	);
} );
