/**
 * External Dependencies
 */
import { BigSkyLogo } from '@automattic/components';
import { AgentsManagerSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef, useCallback } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { AGENTS_MANAGER_STORE } from '../stores';
import { AgentsManagerContainer } from './agents-manager-container';
import '../styles.scss';

type AgentsManagerProps = {
	handleClose: () => void;
	hidden?: boolean;
};

const AgentsManager: React.FC< AgentsManagerProps > = ( { hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	const {
		isOpen,
		isDocked,
		agentsManagerRouterHistory: routerHistory,
	} = useSelect( ( select ) => {
		const agentsManagerSelect: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return agentsManagerSelect.getAgentsManagerState();
	}, [] );

	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );

	const handleOpen = useCallback( () => {
		setIsOpen( true );
	}, [ setIsOpen ] );

	const handleClose = useCallback( () => {
		setIsOpen( false );
	}, [ setIsOpen ] );

	const handleToggleDock = useCallback( () => {
		setIsDocked( ! isDocked );
	}, [ setIsDocked, isDocked ] );

	useEffect( () => {
		const classes = [ 'agents-manager' ];
		portalParent.classList.add( ...classes );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	// Closed state: Show FAB button
	if ( ! isOpen ) {
		return createPortal(
			<button
				className="agents-manager__fab"
				onClick={ handleOpen }
				aria-label="Open Agents Manager"
			>
				<BigSkyLogo.CentralLogo size={ 32 } fill="#3858E9" heartless />
			</button>,
			portalParent
		);
	}

	if ( hidden ) {
		return null;
	}

	return createPortal(
		<AgentsManagerContainer
			isDocked={ isDocked }
			onToggleDock={ handleToggleDock }
			onClose={ handleClose }
			routerHistory={ routerHistory }
		/>,
		portalParent
	);
};

export default AgentsManager;
