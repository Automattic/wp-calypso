import { __ } from '@wordpress/i18n';
import { removeBug } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { spamNote } from '../../panel/state/notes/thunks';
import { RestClientContext } from '../context';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const SpamButton = ( { note, spamNote } ) => {
	const restClient = useContext( RestClientContext );

	return (
		<ActionButton
			icon={ removeBug }
			isActive={ false }
			hotkey={ keys.KEY_S }
			onToggle={ () => spamNote( note, restClient ) }
			text={ __( 'Spam' ) }
			title={ __( 'Mark comment as spam' ) }
		/>
	);
};

SpamButton.propTypes = {
	note: PropTypes.object.isRequired,
};

export default connect( null, { spamNote } )( SpamButton );
