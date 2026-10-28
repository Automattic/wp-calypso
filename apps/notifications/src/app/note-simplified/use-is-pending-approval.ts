import { useSelector } from 'react-redux';
import getIsNotePendingApproval from '../../panel/state/selectors/get-is-note-pending-approval';
import type { Note } from '../types';

export const useIsPendingApproval = ( note: Note ): boolean =>
	useSelector( ( state ) => getIsNotePendingApproval( state, note ) );
