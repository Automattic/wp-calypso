/**
 * External Dependencies
 */
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import TourKitFrame from './tour-kit-frame';
import type { Config } from '../types';

import '../styles.scss';

interface Props {
	config: Config;
}

const TourKitPortal: React.FunctionComponent< Props > = ( { config } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		// @todo clk "tour-kit"
		portalParent.classList.add( 'tour-kit-portal' );
		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return <div>{ createPortal( <TourKitFrame config={ config } />, portalParent ) }</div>;
};

export default TourKitPortal;
