import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/reader/sites/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';

function HovercardContent( props ) {
	const dispatch = useDispatch();
	const { user } = props;

	const primaryBlogId = user?.primary_blog || user?.site_ID;
	const site = useSelector( ( state ) => getSite( state, primaryBlogId ) );
	const primaryBlogUrl = site?.URL;

	useEffect( () => {
		if ( ! site && user.ID ) {
			dispatch( requestSite( primaryBlogId ) );
		}
	}, [ user, dispatch, site, primaryBlogId ] );

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
