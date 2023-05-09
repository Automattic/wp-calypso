import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { RestClientContext } from '../Notifications';
import { keys } from '../helpers/input';
import { getReferenceId } from '../helpers/notes';
import { setApproveStatus as setApproveStatusAction } from '../state/notes/thunks';
import ActionButton from './action-button';

const ApproveButton = ( { isApproved, note, translate, setApproveStatus } ) => {
	const restClient = useContext( RestClientContext );

	return (
		<ActionButton
			icon="checkmark"
			isActive={ isApproved }
			hotkey={ keys.KEY_A }
			onToggle={ () =>
				setApproveStatus(
					note.id,
					getReferenceId( note, 'site' ),
					getReferenceId( note, 'comment' ),
					! isApproved,
					note.type,
					restClient
				)
			}
			text={
				isApproved
					? translate( 'Approved', { context: 'verb: past-tense' } )
					: translate( 'Approve', { context: 'verb: imperative' } )
			}
			title={
				isApproved
					? translate( 'Unapprove comment', { context: 'verb: imperative' } )
					: translate( 'Approve comment', { context: 'verb: imperative' } )
			}
		/>
	);
};

ApproveButton.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { setApproveStatus: setApproveStatusAction } )(
	localize( ApproveButton )
);
