/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getRewindRestoreProgress,
	rewindRequestDismiss,
	rewindRestore,
} from 'state/activity-log/actions';
import Confirm from './confirm';
import getRestoreProgress from 'state/selectors/get-restore-progress';
import getRequestedRewind from 'state/selectors/get-requested-rewind';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';

enum RestoreState {
	Confirm,
	InProgress,
	Finished,
	Error,
}

interface Props {
	restoreId?: string;
}

//todo: move to dedicated types file
interface RestoreProgress {
	errorCode: string;
	failureReason: string;
	message: string;
	percent: number;
	restoreId?: number;
	status: 'queued' | 'running' | 'finished';
	rewindId: string;
}

const getRewindState = ( restoreProgress: RestoreProgress | null ) => {};

const BackupRestorePage = ( { restoreId }: Props ) => {
	const dispatch = useDispatch();

	// todo: not an actual local state
	// const [ restoreState: RestoreState, setRestoreState ] = useState( RestoreState.Confirm );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const restoreProgress: RestoreProgress | null = useSelector( state =>
		getRestoreProgress( state, selectedSiteId )
	);
	const requestedRestoreId = useSelector( state => getRequestedRewind( state, selectedSiteId ) );

	const onConfirm = useCallback(
		() =>
			selectedSiteId && restoreId
				? dispatch( rewindRestore( selectedSiteId, restoreId, {} ) )
				: null,
		[ dispatch, selectedSiteId, restoreId ]
	);

	console.log( 'restoreProgress: ', restoreProgress );

	// switch ( restoreState ) {
	// 	case RestoreState.Confirm:
	// 	default:
	return (
		<div>
			{ requestedRestoreId && (
				<QueryRewindRestoreStatus siteId={ selectedSiteId } restoreId={ requestedRestoreId } />
			) }
			<Confirm selectedSiteId={ selectedSiteId } restoreId={ restoreId } onConfirm={ onConfirm } />
		</div>
	);

	// }
};

// todo: remove, for reference purposes
// BackupRestorePage.propTypes = {
// 		restoreProgress: PropTypes.shape( {
// 			errorCode: PropTypes.string.isRequired,
// 			failureReason: PropTypes.string.isRequired,
// 			message: PropTypes.string.isRequired,
// 			percent: PropTypes.number.isRequired,
// 			restoreId: PropTypes.number,
// 			status: PropTypes.oneOf( [
// 				'finished',
// 				'queued',
// 				'running',

// 				// These are other VP restore statuses.
// 				// We should _never_ see them for Activity Log rewinds
// 				// 'aborted',
// 				// 'fail',
// 				// 'success',
// 				// 'success-with-errors',
// 			] ).isRequired,
// 			rewindId: PropTypes.string.isRequired,
// 		} ),

// 	};

export default BackupRestorePage;

// export default connect(
// 	state => {
// 		const siteId = getSelectedSiteId( state );

// 		return {
// 			siteId,
// 		};
// 	},
// 	( dispatch, { restoreId, siteId } ) => {
// 		restore: () => dispatch( rewindRestore( siteId, restoreId ) );
// 	}
// )( BackupRestorePage );
