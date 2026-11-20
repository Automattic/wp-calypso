import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { spamNote } from '../../panel/state/notes/thunks';
import ActionButton from './action-button';
import usePendingNotes from './use-pending-notes';

// The `caution` icon's exclamation mark in a circle, with its 1.5px stroke, drawn 15px across
// instead of 16px so it matches the other actions' icons rather than outweighing them.
const caution = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		style={ { fill: 'none' } }
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinejoin="round"
	>
		<path d="M12 8.3V12.95M12 14.35V15.75M5.25 12a6.75 6.75 0 1 0 13.5 0a6.75 6.75 0 1 0 -13.5 0Z" />
	</svg>
);

// eslint-disable-next-line no-shadow
const SpamButton = ( { isMinimal, note, spamNote, goBack } ) => {
	const { isPending, start, finish } = usePendingNotes();
	const isBusy = isPending( note.id );

	const handleSpam = async () => {
		if ( isBusy ) {
			return;
		}
		start( note.id );
		try {
			await spamNote( note, true );
		} catch {
			finish( note.id );
			return;
		}
		goBack();
	};

	return (
		<ActionButton
			icon={ caution }
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
