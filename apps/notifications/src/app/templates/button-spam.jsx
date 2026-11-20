import { __ } from '@wordpress/i18n';
import { removeBug } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { spamNote } from '../../panel/state/notes/thunks';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const SpamButton = ( { isMinimal, note, spamNote, goBack } ) => {
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
			// Beside Like and Approve it takes their gray, as in the Actions menu, where only
			// Move to trash is destructive.
			isDestructive={ ! isMinimal }
			isMinimal={ isMinimal }
			isBusy={ isBusy }
			hotkey="s"
			onToggle={ handleSpam }
			text={ __( 'Spam' ) }
			title={ __( 'Mark comment as spam' ) }
		/>
	);
};

SpamButton.propTypes = {
	isMinimal: PropTypes.bool,
	note: PropTypes.object.isRequired,
	goBack: PropTypes.func.isRequired,
};

export default connect( null, { spamNote } )( SpamButton );
