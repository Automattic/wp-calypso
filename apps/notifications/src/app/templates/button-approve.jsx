import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
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

const ApproveButton = ( { className, isApproved, isMinimal, note, setApproveStatus } ) => {
	const { client } = useAppContext();

	return (
		<ActionButton
			className={ className }
			icon={ check }
			isActive={ isApproved }
			isMinimal={ isMinimal }
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
	className: PropTypes.string,
	isApproved: PropTypes.bool.isRequired,
	isMinimal: PropTypes.bool,
	note: PropTypes.object.isRequired,
};

export default connect( null, { setApproveStatus: setApproveStatusAction } )( ApproveButton );
