/**
 * External Dependencies
 */
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import TourFrame from './tour-frame';
import type { Config } from '../types';

import '../styles.scss';

interface Props {
	config: Config;
}

const TourPortal: React.FunctionComponent< Props > = ( { config } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		// @todo clk "packaged-tour"
		portalParent.classList.add( 'packaged-tour__portal-parent' );
		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return <div>{ createPortal( <TourFrame config={ config } />, portalParent ) }</div>;
};

export default TourPortal;
