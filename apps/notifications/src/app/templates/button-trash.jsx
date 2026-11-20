import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { trashNote } from '../../panel/state/notes/thunks';
import ActionButton from './action-button';
import usePendingNotes from './use-pending-notes';

// eslint-disable-next-line no-shadow
const TrashButton = ( { note, trashNote, goBack } ) => {
	const { isPending, start, finish } = usePendingNotes();
	const isBusy = isPending( note.id );

	const handleTrash = async () => {
		if ( isBusy ) {
			return;
		}
		start( note.id );
		try {
			await trashNote( note, true );
		} catch {
			finish( note.id );
			return;
		}
		goBack();
	};

	return (
		<ActionButton
			icon={ trash }
			isActive={ false }
			isDestructive
			isBusy={ isBusy }
			hotkey="t"
			onToggle={ handleTrash }
			text={ __( 'Trash' ) }
			title={ __( 'Trash comment' ) }
		/>
	);
};

TrashButton.propTypes = {
	note: PropTypes.object.isRequired,
	goBack: PropTypes.func.isRequired,
};

export default connect( null, { trashNote } )( TrashButton );
