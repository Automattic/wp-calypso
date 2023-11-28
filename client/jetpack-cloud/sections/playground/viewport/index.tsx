import { startPlaygroundWeb } from '@wp-playground/client';
import { useEffect, useRef } from 'react';
import './styles.scss';
const Viewport = () => {
	const iframeRef = useRef( null );

	useEffect( () => {
		if ( iframeRef.current ) {
			startPlaygroundWeb( {
				iframe: iframeRef.current,
				remoteUrl: `https://playground.wordpress.net/remote.html?mode=seamless`,
			} );
		}
	}, [] );

	return (
		<div className="jetpack-manage-playground-viewport">
			<iframe
				id="jetpack-manage-playground-iframe"
				className="jetpack-manage-playground-viewport__iframe"
				title="Jetpack Manage Playground"
			/>
		</div>
	);
};

export default Viewport;
