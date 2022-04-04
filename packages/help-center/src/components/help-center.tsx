/**
 * External Dependencies
 */
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import HelpCenterContainer from './help-center-container';
import { Container } from './types';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { content, handleClose } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

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
				<HelpCenterContainer handleClose={ handleClose } content={ content } />,
				portalParent
			) }
		</div>
	);
};

export default HelpCenter;
