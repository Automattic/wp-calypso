/**
 * External Dependencies
 */
import { useSelect } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { Container } from '../types';
import { SITE_STORE } from './help-center-contact-form';
import HelpCenterContainer from './help-center-container';
import '../styles.scss';

const HelpCenter: React.FC< Container > = ( {
	content,
	handleClose,
	defaultHeaderText,
	defaultFooterContent,
} ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	// prefetch the current site
	useSelect( ( select ) => select( SITE_STORE ).getSite( window._currentSiteId ) );

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
			defaultHeaderText={ defaultHeaderText }
			defaultFooterContent={ defaultFooterContent }
		/>,
		portalParent
	);
};

export default HelpCenter;
