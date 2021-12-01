// import { TourKitContextProvider } from './tour-kit-context';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import ErrorBoundary from '../error-boundary';
import TourKitFrame from './tour-kit-frame';
import type { Config } from '../types';

import '../styles.scss';

interface Props {
	config: Config;
	__temp__className?: string;
}

const TourKit: React.FunctionComponent< Props > = ( { config, __temp__className } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		const classes = [ 'tour-kit', ...( __temp__className ? [ __temp__className ] : [] ) ];

		portalParent.classList.add( ...classes );
		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ __temp__className, portalParent ] );

	return (
		<ErrorBoundary>
			<div>{ createPortal( <TourKitFrame config={ config } />, portalParent ) }</div>
		</ErrorBoundary>
	);
};

export default TourKit;
