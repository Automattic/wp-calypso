/**
 * External Dependencies
 */
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( {
	content,
	handleClose,
	headerText,
	footerContent,
} ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return createPortal(
		<HelpCenterContainer
			handleClose={ handleClose }
			content={ content }
			headerText={ headerText }
			footerContent={ footerContent }
		/>,
		portalParent
	);
};

export default HelpCenter;
