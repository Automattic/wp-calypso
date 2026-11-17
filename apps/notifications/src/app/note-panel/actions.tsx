import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cog } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
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
				onClick={ () => dispatch( actions.ui.viewSettings() ) }
			/>
		</>
	);
}
