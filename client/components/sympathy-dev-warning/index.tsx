import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	developerNotificationCompleted,
	sympathyWarningNotice,
} from 'calypso/state/startup-flags/actions';
import { getIsStateRandomlyCleared } from 'calypso/state/startup-flags/selectors';

export function SympathyDevWarning() {
	const dispatch = useDispatch();
	const isStateRandomlyCleared = useSelector( getIsStateRandomlyCleared );

	useEffect( () => {
		if ( isStateRandomlyCleared ) {
			setTimeout( () => {
				dispatch( sympathyWarningNotice() );
				dispatch( developerNotificationCompleted() );
			}, 1200 );
		}
	}, [ isStateRandomlyCleared, dispatch ] );
	return null;
}

export default SympathyDevWarning;
