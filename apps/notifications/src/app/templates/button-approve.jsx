import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { getReferenceId } from '../../panel/helpers/notes';
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

const ApproveButton = ( { isApproved, isMinimal, note, setApproveStatus } ) => {
	const { client } = useAppContext();
	const [ isBusy, setIsBusy ] = useState( false );
	// A minimal button names what it does, so an approved comment's reads "Unapprove".
	const isUnapprove = isMinimal && isApproved;

	// The button stays in place as it toggles, so a second press waits for the first to land,
	// which keeps them from reaching the server out of order.
	const handleToggle = async () => {
		if ( isBusy ) {
			return;
		}
		setIsBusy( true );
		await setApproveStatus(
			note.id,
			getReferenceId( note, 'site' ),
			getReferenceId( note, 'comment' ),
			! isApproved,
			note.type,
			client
		);
		setIsBusy( false );
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
			isBusy={ isBusy }
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

export default connect( null, { setApproveStatus: setApproveStatusAction } )( ApproveButton );
