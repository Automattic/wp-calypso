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
import '../styles.scss';

type AgentsManagerProps = {
	handleClose: () => void;
	hidden?: boolean;
};

const AgentsManager: React.FC< AgentsManagerProps > = ( { hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	const { isOpen, isDocked } = useSelect( ( select ) => {
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

	// Docked state: Show sidebar on the right
	if ( isDocked ) {
		return createPortal(
			<div className="agents-manager__sidebar">
				<div className="agents-manager__sidebar-header">
					<h2 id="agents-manager-header-text">Agents Manager</h2>
					<div className="agents-manager__sidebar-actions">
						<button
							onClick={ handleToggleDock }
							aria-label="Undock Agents Manager"
							className="agents-manager__icon-button"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M5 5H15V15H5V5Z"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M5 5L15 15"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
						<button
							onClick={ handleClose }
							aria-label="Close Agents Manager"
							className="agents-manager__icon-button"
						>
							×
						</button>
					</div>
				</div>
				<div className="agents-manager__sidebar-content">
					<p>Agents Manager Sidebar (Docked State)</p>
					<p>This is a test interface for the docked state.</p>
				</div>
			</div>,
			portalParent
		);
	}

	// Undocked state: Show modal
	return createPortal(
		<div className="agents-manager__modal">
			<div className="agents-manager__modal-header">
				<h2 id="agents-manager-header-text">Agents Manager</h2>
				<div className="agents-manager__modal-actions">
					<button
						onClick={ handleToggleDock }
						aria-label="Dock Agents Manager"
						className="agents-manager__icon-button"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M5 5H15V15H5V5Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M5 5L15 15"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<button
						onClick={ handleClose }
						aria-label="Close Agents Manager"
						className="agents-manager__icon-button"
					>
						×
					</button>
				</div>
			</div>
			<div className="agents-manager__modal-content">
				<p>Agents Manager Modal (Undocked State)</p>
				<p>This is a test interface for the undocked state.</p>
			</div>
		</div>,
		portalParent
	);
};

export default AgentsManager;
