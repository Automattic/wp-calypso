/**
 * Calypso Site Picker Tool
 *
 * Opens a modal for the user to select one of their WordPress sites.
 * This is a frontend tool that requires user interaction.
 */

import { Modal, Button, Spinner } from '@wordpress/components';
import { useState, useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import './style.scss';
import type {
	Ability,
	SitePickerArgs,
	SitePickerResult,
	SelectedSite,
	ShowSitePickerOptions,
} from '../types';

/**
 * Tool definition for site picker
 */
export const sitePickerAbility: Ability = {
	name: 'calypso/show-site-picker',
	label: 'Site Picker Tool',
	category: 'calypso',
	description:
		'THIS IS THE SITE PICKER TOOL. Opens an interactive modal dialog where the user can browse and select from their WordPress sites. ' +
		'Use this tool when the user says "use the site picker tool", "pick a site", "switch sites", "select a site", "choose a site", or "show sites". ' +
		'Do NOT navigate to /sites - use this tool instead to show the site picker modal.',
	input_schema: {
		type: 'object',
		properties: {
			prompt: {
				type: 'string',
				description: 'Optional message to show the user explaining why they need to pick a site',
			},
		},
	},
	meta: {
		annotations: {
			readonly: true,
			destructive: false,
			idempotent: true,
		},
		frontend_callback: true,
	},
};

/**
 * Execute the site picker tool
 *
 * @param args - Site picker arguments
 * @param showSitePicker - Function to show the site picker modal
 * @returns Promise that resolves when user selects or cancels
 */
export function executeSitePicker(
	args: SitePickerArgs,
	showSitePicker: ( options: ShowSitePickerOptions ) => void
): Promise< SitePickerResult > {
	// eslint-disable-next-line no-console
	console.log( '[SitePicker] executeSitePicker called with args:', args );

	return new Promise( ( resolve ) => {
		showSitePicker( {
			prompt: args.prompt,
			onSelect: ( site: SelectedSite ) => {
				// eslint-disable-next-line no-console
				console.log( '[SitePicker] Site selected:', site );
				const result = { success: true, site };
				// eslint-disable-next-line no-console
				console.log( '[SitePicker] Resolving with result:', result );
				resolve( result );
			},
			onCancel: () => {
				// eslint-disable-next-line no-console
				console.log( '[SitePicker] Cancelled' );
				resolve( { success: false, cancelled: true } );
			},
		} );
	} );
}

/**
 * Site Picker Modal Component
 */
export function SitePickerModal( {
	isOpen,
	onSelect,
	onCancel,
	prompt,
}: {
	isOpen: boolean;
	onSelect: ( site: SelectedSite ) => void;
	onCancel: () => void;
	prompt?: string;
} ) {
	const [ sites, setSites ] = useState< SelectedSite[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );

	// Fetch sites when modal opens
	useState( () => {
		if ( isOpen && sites.length === 0 ) {
			setIsLoading( true );
			setError( null );

			wpcomRequest( {
				path: '/me/sites',
				apiVersion: '1.1',
			} )
				.then( ( response: { sites: SelectedSite[] } ) => {
					setSites( response.sites || [] );
					setIsLoading( false );
				} )
				.catch( ( err: Error ) => {
					setError( err.message || 'Failed to load sites' );
					setIsLoading( false );
				} );
		}
	} );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title="Select a Site"
			onRequestClose={ onCancel }
			className="calypso-tools-site-picker-modal"
		>
			{ prompt && <p className="calypso-tools-site-picker-prompt">{ prompt }</p> }

			{ isLoading && (
				<div className="calypso-tools-site-picker-loading">
					<Spinner />
					<p>Loading your sites...</p>
				</div>
			) }

			{ error && (
				<div className="calypso-tools-site-picker-error">
					<p>Error: { error }</p>
					<Button variant="secondary" onClick={ onCancel }>
						Close
					</Button>
				</div>
			) }

			{ ! isLoading && ! error && sites.length === 0 && (
				<div className="calypso-tools-site-picker-empty">
					<p>No sites found.</p>
					<Button variant="secondary" onClick={ onCancel }>
						Close
					</Button>
				</div>
			) }

			{ ! isLoading && ! error && sites.length > 0 && (
				<div className="calypso-tools-site-picker-list">
					{ sites.map( ( site ) => (
						<button
							key={ site.ID }
							className="calypso-tools-site-picker-item"
							onClick={ () => onSelect( site ) }
						>
							<div className="calypso-tools-site-picker-item-details">
								<div className="calypso-tools-site-picker-item-name">{ site.name }</div>
								<div className="calypso-tools-site-picker-item-url">{ site.URL }</div>
							</div>
						</button>
					) ) }
				</div>
			) }

			<div className="calypso-tools-site-picker-actions">
				<Button variant="secondary" onClick={ onCancel }>
					Cancel
				</Button>
			</div>
		</Modal>
	);
}

/**
 * Hook to manage site picker state
 */
export function useSitePicker() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ options, setOptions ] = useState< ShowSitePickerOptions | null >( null );

	const showSitePicker = useCallback( ( opts: ShowSitePickerOptions ) => {
		setOptions( opts );
		setIsOpen( true );
	}, [] );

	const handleSelect = useCallback(
		( site: SelectedSite ) => {
			setIsOpen( false );
			if ( options?.onSelect ) {
				options.onSelect( site );
			}
			setOptions( null );
		},
		[ options ]
	);

	const handleCancel = useCallback( () => {
		setIsOpen( false );
		if ( options?.onCancel ) {
			options.onCancel();
		}
		setOptions( null );
	}, [ options ] );

	const SitePickerModalComponent = useCallback(
		() => (
			<SitePickerModal
				isOpen={ isOpen }
				onSelect={ handleSelect }
				onCancel={ handleCancel }
				prompt={ options?.prompt }
			/>
		),
		[ isOpen, handleSelect, handleCancel, options?.prompt ]
	);

	return {
		showSitePicker,
		SitePickerModalComponent,
	};
}
