import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getReferenceId } from '../../panel/helpers/notes';
import { setApproveStatus as setApproveStatusAction } from '../../panel/state/notes/thunks';
import { useAppContext } from '../context';
import ActionButton from './action-button';

const ApproveButton = ( { isApproved, note, setApproveStatus } ) => {
	const { client } = useAppContext();

	return (
		<ActionButton
			icon={ check }
			isActive={ isApproved }
			hotkey="a"
			onToggle={ () =>
				setApproveStatus(
					note.id,
					getReferenceId( note, 'site' ),
					getReferenceId( note, 'comment' ),
					! isApproved,
					note.type,
					client
				)
			}
			text={ isApproved ? __( 'Approved' ) : __( 'Approve' ) }
			title={ isApproved ? __( 'Unapprove comment' ) : __( 'Approve comment' ) }
		/>
	);
};

ApproveButton.propTypes = {
	isApproved: PropTypes.bool.isRequired,
	note: PropTypes.object.isRequired,
};

export default connect( null, { setApproveStatus: setApproveStatusAction } )( ApproveButton );
