/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import HelpCenterDesktop from './help-center-desktop';

import '../styles.scss';

const HelpCenter: React.FC = () => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const isMobile = useMobileBreakpoint();

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return <div>{ createPortal( isMobile ? null : <HelpCenterDesktop />, portalParent ) }</div>;
};

export default HelpCenter;
