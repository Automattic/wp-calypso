/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { ReactElement } from 'react';
/**
 * Internal Dependencies
 */
import HelpCenterDesktop from './help-center-desktop';

import '../styles.scss';

interface Props {
	content: ReactElement;
	handleClose: () => void;
}

const HelpCenter: React.FC< Props > = ( { content, handleClose } ) => {
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

	return (
		<div>
			{ createPortal(
				isMobile ? null : <HelpCenterDesktop handleClose={ handleClose } content={ content } />,
				portalParent
			) }
		</div>
	);
};

export default HelpCenter;
