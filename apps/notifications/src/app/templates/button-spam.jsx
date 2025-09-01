import { __ } from '@wordpress/i18n';
import { removeBug } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { spamNote } from '../../panel/state/notes/thunks';
import { useAppContext } from '../context';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const SpamButton = ( { note, spamNote } ) => {
	const { client } = useAppContext();

	return (
		<ActionButton
			icon={ removeBug }
			isActive={ false }
			hotkey={ keys.KEY_S }
			onToggle={ () => spamNote( note, client ) }
			text={ __( 'Spam' ) }
			title={ __( 'Mark comment as spam' ) }
		/>
	);
};

SpamButton.propTypes = {
	note: PropTypes.object.isRequired,
};

export default connect( null, { spamNote } )( SpamButton );
