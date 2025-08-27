import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { trashNote } from '../../panel/state/notes/thunks';
import { RestClientContext } from '../context';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const TrashButton = ( { note, trashNote } ) => {
	const restClient = useContext( RestClientContext );

	return (
		<ActionButton
			icon={ trash }
			isActive={ false }
			hotkey={ keys.KEY_T }
			onToggle={ () => trashNote( note, restClient ) }
			text={ __( 'Trash' ) }
			title={ __( 'Trash comment' ) }
		/>
	);
};

TrashButton.propTypes = {
	note: PropTypes.object.isRequired,
};

export default connect( null, { trashNote } )( TrashButton );
