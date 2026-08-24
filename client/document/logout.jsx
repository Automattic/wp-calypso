import { WordPressLogo } from '@automattic/components';

function logoutFn( { redirectTo, counterpartOrigin, statsEnabled, supportSession } ) {
	// Every failure here is silent, so report the outcome — otherwise a clear that
	// stops working looks exactly like one that succeeded.
	function bump( outcome ) {
		if ( ! statsEnabled ) {
			return;
		}

		const url =
			window.location.protocol +
			'//pixel.wp.com/g.gif?v=wpcom-no-pv&x_logout-clear-site-data=' +
			outcome +
			'&t=' +
			Math.random();

		try {
			if ( window.fetch ) {
				// `keepalive` so the request outlives the redirect below.
				window.fetch( url, { mode: 'no-cors', keepalive: true } ).catch( function () {} );
			} else {
				new window.Image().src = url;
			}
		} catch ( e ) {}
	}

	let settled = false;
	function done( outcome ) {
		if ( settled ) {
			return;
		}
		settled = true;
		bump( outcome );
		window.location.replace( redirectTo );
	}

	// Reported separately so a deliberate skip isn't counted as a failed clear.
	if ( supportSession ) {
		done( 'support-session' );
		return;
	}

	const iframe = document.getElementById( 'logout-clear-frame' );

	if ( ! iframe ) {
		done( 'no-counterpart' );
		return;
	}

	// Wait for the counterpart to report what it did, rather than for `load`,
	// which fires even when the frame was blocked or served an error page.
	window.addEventListener( 'message', function ( event ) {
		if ( event.origin !== counterpartOrigin ) {
			return;
		}
		if ( ! event.data || event.data.type !== 'wpcom-logout-clear' ) {
			return;
		}
		done( event.data.cleared ? 'counterpart-cleared' : 'counterpart-not-cleared' );
	} );

	window.setTimeout( function () {
		done( 'counterpart-timeout' );
	}, 2000 );
}

function embedFn( { cleared, embedderOrigin } ) {
	if ( window.parent !== window ) {
		window.parent.postMessage( { type: 'wpcom-logout-clear', cleared: cleared }, embedderOrigin );
	}
}

function Logout( {
	redirectTo = '/log-in',
	iframeSrc = null,
	embed = false,
	cleared = false,
	embedderOrigin = null,
	statsEnabled = false,
	supportSession = false,
} ) {
	// Loaded inside the counterpart's iframe: carries the header, and reports back
	// whether it was actually set.
	if ( embed ) {
		return (
			<html lang="en">
				<body>
					{ /* eslint-disable react/no-danger */ }
					{ embedderOrigin && (
						<script
							dangerouslySetInnerHTML={ {
								__html: `
								const embedFn = ${ embedFn.toString() };

								embedFn( { cleared: ${ cleared ? 'true' : 'false' }, embedderOrigin: "${ encodeURI(
									embedderOrigin
								) }" } );
								`,
							} }
						/>
					) }
					{ /* eslint-enable react/no-danger */ }
				</body>
			</html>
		);
	}

	return (
		<html lang="en">
			<body>
				{ /* eslint-disable react/no-danger */ }
				{ /* Same boot placeholder as `document/index.jsx`, with the styles
				     inlined because this page loads no stylesheet. */ }
				<style
					dangerouslySetInnerHTML={ {
						__html: `
							body { margin: 0; }
							.wpcom-site__logo,
							.wpcom-site__logo path {
								fill: var(--color-neutral-10, #c3c4c7);
								color: var(--color-neutral-10, #c3c4c7);
							}
							.wpcom-site__logo {
								position: fixed;
								top: 50%;
								left: 50%;
								transform: translate(-50%, -50%);
							}
						`,
					} }
				/>
				<div id="wpcom" className="wpcom-site">
					<WordPressLogo size={ 72 } className="wpcom-site__logo" />
				</div>
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

						logoutFn( {
							redirectTo: "${ encodeURI( redirectTo ) }",
							counterpartOrigin: ${ iframeSrc ? `"${ encodeURI( new URL( iframeSrc ).origin ) }"` : 'null' },
							statsEnabled: ${ statsEnabled ? 'true' : 'false' },
							supportSession: ${ supportSession ? 'true' : 'false' },
						} );
						`,
					} }
				/>
				{ /* eslint-enable react/no-danger */ }
			</body>
		</html>
	);
}

export default Logout;
