import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { connect } from 'react-redux';
import { getReferenceId } from '../../panel/helpers/notes';
import { approveNote as approveNoteAction } from '../../panel/state/notes/actions';
import { setApproveStatus as setApproveStatusAction } from '../../panel/state/notes/thunks';
import { useAppContext } from '../context';
import ActionButton from './action-button';

const check = (
	<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M18.2446 8.03027L9.71436 16.5605L5.75537 12.6016L6.81592 11.541L9.71436 14.4395L17.1841 6.96973L18.2446 8.03027Z" />
	</svg>
);

// The `closeSmall` icon's 1.5px stroke, a little wider so it holds its own beside the check.
const cross = (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		style={ { fill: 'none' } }
		stroke="currentColor"
		strokeWidth="1.5"
	>
		<path d="M7.25 16.75L16.75 7.25M16.75 16.75L7.25 7.25" />
	</svg>
);

const ApproveButton = ( { approveNote, isApproved, isMinimal, note, setApproveStatus } ) => {
	const { client } = useAppContext();
	// The approval last asked for on each note whose request is still out. It is per note,
	// since the same button shows the next note opened meanwhile.
	const wantedRef = useRef( new Map() );
	// A minimal button names what it does, so an approved comment's reads "Unapprove".
	const isUnapprove = isMinimal && isApproved;

	// The button toggles in place, so it can be pressed again before the server answers. A press
	// while a request is out shows at once, and the last one is sent once that request lands, so
	// the requests reach the server in order and the last press wins.
	const handleToggle = async () => {
		const wanted = wantedRef.current;
		const isQueued = wanted.has( note.id );
		wanted.set( note.id, ! isApproved );
		if ( isQueued ) {
			approveNote( note.id, ! isApproved );
			return;
		}

		let sent;
		do {
			sent = wanted.get( note.id );
			await setApproveStatus(
				note.id,
				getReferenceId( note, 'site' ),
				getReferenceId( note, 'comment' ),
				sent,
				note.type,
				client
			);
		} while ( wanted.get( note.id ) !== sent );
		wanted.delete( note.id );
	};

	const getText = () => {
		if ( isUnapprove ) {
			return __( 'Unapprove' );
		}
		return isApproved ? __( 'Approved' ) : __( 'Approve' );
	};

	return (
		<ActionButton
			icon={ isUnapprove ? cross : check }
			isActive={ isApproved && ! isMinimal }
			isMinimal={ isMinimal }
			hotkey="a"
			onToggle={ handleToggle }
			text={ getText() }
			title={ isApproved ? __( 'Unapprove comment' ) : __( 'Approve comment' ) }
		/>
	);
};

ApproveButton.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	isMinimal: PropTypes.bool,
	note: PropTypes.object.isRequired,
};

export default connect( null, {
	approveNote: approveNoteAction,
	setApproveStatus: setApproveStatusAction,
} )( ApproveButton );
