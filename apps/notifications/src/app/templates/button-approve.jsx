import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { getReferenceId } from '../../panel/helpers/notes';
import { setApproveStatus as setApproveStatusAction } from '../../panel/state/notes/thunks';
import { RestClientContext } from '../context';
import ActionButton from './action-button';

const ApproveButton = ( { isApproved, note, setApproveStatus } ) => {
	const restClient = useContext( RestClientContext );

	return (
		<ActionButton
			icon={ check }
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
