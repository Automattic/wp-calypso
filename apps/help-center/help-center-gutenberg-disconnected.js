import './config';
import { HelpIcon } from '@automattic/help-center';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useEffect, useReducer } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import ReactDOM from 'react-dom';
import { useCanvasMode } from './hooks/use-canvas-mode';
import './help-center.scss';

function HelpCenterContent() {
	const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const canvasMode = useCanvasMode();

	const sidebarActionsContainer = document.querySelector( '.edit-site-site-hub__actions' );

	const content = (
		<>
			<Button
				className="help-center"
				href="https://wordpress.com/help"
				icon={ <HelpIcon /> }
				label="Help"
				size={ ! canvasMode || canvasMode === 'edit' ? 'compact' : undefined }
				target="_blank"
			/>
		</>
	);

	useEffect( () => {
		// Force to re-render to ensure the sidebar is available.
		if ( canvasMode === 'view' ) {
			forceUpdate();
		}
	}, [ canvasMode ] );

	if ( canvasMode === 'view' ) {
		return sidebarActionsContainer && ReactDOM.createPortal( content, sidebarActionsContainer );
	}

	return isDesktop && <Fill name="PinnedItems/core">{ content }</Fill>;
}

registerPlugin( 'jetpack-help-center', {
	render: () => {
		return <HelpCenterContent />;
	},
} );
