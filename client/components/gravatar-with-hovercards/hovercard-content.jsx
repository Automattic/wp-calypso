import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/reader/sites/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';

function HovercardContent( props ) {
	const dispatch = useDispatch();
	const { user } = props;

	// Prefer wpcom_id when it is given. Sometimes ID is specific to another site and wpcom_id is
	// accurate. Use ID as a fallback as sometimes wpcom_id isn't provided (like self user data).
	const userID = user.wpcom_id || user.ID;

	// For some reason there are places where the user object passes in primary blog of -1. Lets
	// find the read one with this selector.
	const readerUserData = useSelector( ( state ) => getReaderUser( state, userID, true ) );

	const primaryBlogId = readerUserData?.primary_blog || user?.primary_blog || user?.site_ID;
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) );
	const primaryBlogUrl = site?.URL;

	useEffect( () => {
		if ( ! userID ) {
			// This isnt a wpcom user, skip requesting data.
			return;
		}

		if ( ! site ) {
			dispatch( requestSite( primaryBlogId ) );
		}
		if ( ! readerUserData ) {
			dispatch( requestUser( userID, true ) );
		}
	}, [ userID, dispatch, site, primaryBlogId, readerUserData ] );

	if ( ! user.ID ) {
		return null;
	}

	return (
		<>
			<div className="gravatar-hovercard__body">
				{ primaryBlogUrl && <ReaderFollowButton siteUrl={ primaryBlogUrl } /> }
				{ /* TODO: Add primary blog subscribe card */ }
			</div>
			<div className="gravatar-hovercard__footer">{ /* TODO: Add recommended blogs list */ }</div>
		</>
	);
}

export default function HovercardContentPortal( { mountNode, ...props } ) {
	if ( ! mountNode ) {
		return null;
	}

	return ReactDOM.createPortal( <HovercardContent { ...props } />, mountNode );
}
