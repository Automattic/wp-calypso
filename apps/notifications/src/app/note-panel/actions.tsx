import NoteShortcuts from '../note-shortcuts';
import NoteSettingsButton from './settings-button';

export default function NotePanelActions() {
	return (
		<>
			<NoteShortcuts />
			<NoteSettingsButton />
		</>
	);
}
