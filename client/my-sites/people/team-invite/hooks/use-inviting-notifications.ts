import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSendInviteState } from 'calypso/state/invites/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export function useInvitingNotifications( tokenValues: string[] ) {
	const _ = useTranslate();
	const dispatch = useDispatch();
	const { error, errorType, success, failure, progress } = useSelector( getSendInviteState );
	const [ prevProgress, setPrevProgress ] = useState( progress );
	const noticeConfig = { displayOnNextPage: true };

	useEffect( () => setPrevProgress( progress ), [ progress ] );
	useEffect( () => prevProgress && error && showInvitingErrorNotice(), [ error ] );
	useEffect( () => prevProgress && success && showInvitingSuccessNotice(), [ success ] );
	useEffect( () => prevProgress && failure && showInvitingFailureNotice(), [ failure ] );

	function showInvitingErrorNotice() {
		let msg;

		if ( errorType === 'partial' ) {
			msg = _( 'Some invitations failed to send' );
		} else {
			msg = _( 'Invitation failed to send', 'Invitations failed to send', {
				count: tokenValues.length,
				context: 'Displayed in a notice when all invitations failed to send.',
			} );
		}
		dispatch( errorNotice( msg, noticeConfig ) );
	}

	function showInvitingFailureNotice() {
		const msg = _( "Sorry, we couldn't process your invitations. Please try again later." );
		dispatch( errorNotice( msg, noticeConfig ) );
	}

	function showInvitingSuccessNotice() {
		const msg = _( 'Invitation sent successfully', 'Invitations sent successfully', {
			count: tokenValues.length,
		} );
		dispatch( successNotice( msg, noticeConfig ) );
	}
}
