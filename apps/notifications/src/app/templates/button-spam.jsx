import { __ } from '@wordpress/i18n';
import { removeBug } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { spamNote } from '../../panel/state/notes/thunks';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const SpamButton = ( { note, spamNote, goBack } ) => {
	const [ isBusy, setIsBusy ] = useState( false );

	const handleSpam = async () => {
		setIsBusy( true );
		await spamNote( note, true );
		goBack();
	};

	return (
		<ActionButton
			icon={ removeBug }
			isActive={ false }
			isBusy={ isBusy }
			hotkey="s"
			onToggle={ handleSpam }
			text={ __( 'Spam' ) }
			title={ __( 'Mark comment as spam' ) }
		/>
	);
};

SpamButton.propTypes = {
	note: PropTypes.object.isRequired,
	goBack: PropTypes.func.isRequired,
};

export default connect( null, { spamNote } )( SpamButton );
