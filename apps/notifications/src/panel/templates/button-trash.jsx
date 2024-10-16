import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { RestClientContext } from '../Notifications';
import { keys } from '../helpers/input';
import { trashNote } from '../state/notes/thunks';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const TrashButton = ( { note, translate, trashNote } ) => {
	const restClient = useContext( RestClientContext );

	return (
		<ActionButton
			icon="trash"
			isActive={ false }
			hotkey={ keys.KEY_T }
			onToggle={ () => trashNote( note, restClient ) }
			text={ translate( 'Trash', { context: 'verb: imperative' } ) }
			title={ translate( 'Trash comment', { context: 'verb: imperative' } ) }
		/>
	);
};

TrashButton.propTypes = {
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { trashNote } )( localize( TrashButton ) );
