import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';

const testPath = '/wpcom/me/test';

export const PinghubTest = () => {
	const [ connected, setConnected ] = useState( false );

	const connect = () => {
		wpcom.pinghub.connect( testPath, ( error, event ) => {
			if ( error === null && event.response.type === 'open' ) {
				setConnected( true );
			}

			if ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Error connecting to pinghub', error );
			}
		} );
	};

	const disconnect = () => {
		wpcom.pinghub.disconnect( testPath );
		setConnected( false );
	};

	useEffect( () => {
		connect();
	}, [] );

	return (
		<>
			<h2>Pinghub test</h2>
			{ connected ? (
				<>
					<p>Connected to { testPath }</p>
					<button className="components-button button-action" onClick={ disconnect }>
						Click to disconnect
					</button>
				</>
			) : (
				<>
					<p>Not connected</p>
					<button className="components-button button-action" onClick={ connect }>
						Click to connect
					</button>
				</>
			) }
		</>
	);
};
