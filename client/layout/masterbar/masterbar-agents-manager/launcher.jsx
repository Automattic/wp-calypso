import { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	useDispatch as useDataStoreDispatch,
	useSelect as useDataStoreSelect,
} from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSectionName } from 'calypso/state/ui/selectors';
import Item from '../item';
import AgentsManagerIcon from './agents-manager-icon';

/**
 * Masterbar launcher for Agents Manager in the coexistence experience.
 *
 * Unlike the legacy `MasterbarAgentsManager` dropdown, this is a plain sparkle
 * button that appears only when Agents Manager is fully closed — not open and
 * not minimized. When AM is open (panel) or minimized (the "Ask AI" bar), that
 * surface is the entry point, so this launcher hides itself. Clicking it opens
 * Agents Manager.
 */
const MasterbarAgentsManagerLauncher = ( { tooltip } ) => {
	const translate = useTranslate();
	const sectionName = useSelector( getSectionName );

	// `isOpen` is true for both the open panel and the minimized bar; it is only
	// false when AM is fully hidden, which is exactly when the launcher shows.
	const isOpen = useDataStoreSelect( ( select ) => select( AGENTS_MANAGER_STORE ).getIsOpen(), [] );
	const { setIsOpen, setIsMinimized } = useDataStoreDispatch( AGENTS_MANAGER_STORE );

	if ( isOpen ) {
		return null;
	}

	const handleClick = () => {
		recordTracksEvent( 'calypso_inlinehelp_show', {
			force_site_id: true,
			location: 'agents-manager',
			section: sectionName,
		} );
		// Always open to the full chat — clear any persisted minimized state so the
		// launcher never lands on the minimized "Ask AI" bar.
		setIsMinimized( false );
		setIsOpen( true );
	};

	return (
		<Item
			onClick={ handleClick }
			className="masterbar__item-agents-manager"
			tooltip={ tooltip ?? translate( 'Assistant' ) }
			icon={ <AgentsManagerIcon hasUnread={ false } /> }
		/>
	);
};

export default MasterbarAgentsManagerLauncher;
