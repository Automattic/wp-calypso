import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from '../../panel/helpers/stats';
import actions from '../../panel/state/actions';
import NoteShortcuts from '../note-shortcuts';

export default function NotePanelActions() {
	const dispatch = useDispatch();

	return (
		<>
			<NoteShortcuts />
			<Button
				size="small"
				icon={ cog }
				label={ __( 'Settings' ) }
				onClick={ () => {
					recordTracksEvent( 'calypso_notification_settings_click' );
					dispatch( actions.ui.viewSettings() );
				} }
			/>
		</>
	);
}
