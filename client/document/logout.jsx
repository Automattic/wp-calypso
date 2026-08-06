function logoutFn( { redirectTo } ) {
	function done() {
		window.location.replace( redirectTo );
	}

	const iframe = document.getElementById( 'logout-clear-frame' );

	if ( ! iframe ) {
		done();
		return;
	}

	// Redirect once the counterpart origin has been cleared, with a fallback in
	// case its iframe never fires `load` (e.g. blocked by the browser).
	const fallback = window.setTimeout( done, 2000 );
	iframe.addEventListener( 'load', function () {
		window.clearTimeout( fallback );
		done();
	} );
}

function Logout( { redirectTo = '/log-in', iframeSrc = null, embed = false } ) {
	// The embed variant is loaded inside the counterpart origin's iframe. Its only
	// job is to carry the `Clear-Site-Data` response header, so it renders nothing.
	if ( embed ) {
		return (
			<html lang="en">
				<body />
			</html>
		);
	}

	return (
		<html lang="en">
			<body>
				{ /* eslint-disable react/no-danger */ }
				<style
					dangerouslySetInnerHTML={ {
						__html: `
							body {
								margin: 0;
								min-height: 100vh;
								display: flex;
								align-items: center;
								justify-content: center;
								font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							}
						`,
					} }
				/>
				<p>Logging out…</p>
				{ iframeSrc && (
					<iframe
						id="logout-clear-frame"
						title="Signing out"
						src={ iframeSrc }
						style={ { display: 'none' } }
					/>
				) }
				<script
					dangerouslySetInnerHTML={ {
						__html: `
						const logoutFn = ${ logoutFn.toString() };

						logoutFn( { redirectTo: "${ encodeURI( redirectTo ) }" } );
						`,
					} }
				/>
				{ /* eslint-enable react/no-danger */ }
			</body>
		</html>
	);
}

export default Logout;
