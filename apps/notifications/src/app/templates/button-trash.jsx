import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { trashNote } from '../../panel/state/notes/thunks';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const TrashButton = ( { note, trashNote, goBack } ) => {
	const [ isBusy, setIsBusy ] = useState( false );

	const handleTrash = async () => {
		setIsBusy( true );
		await trashNote( note, true );
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
