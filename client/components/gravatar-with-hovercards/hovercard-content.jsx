import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';
import Gravatar from '../gravatar';

export default function HovercardContent( props ) {
	const dispatch = useDispatch();
	const { user } = props;

	const userData = useSelector( ( state ) => getReaderUser( state, user.ID, true ) );

	useEffect( () => {
		if ( ! userData ) {
			dispatch( requestUser( user.ID, true ) );
		}
	}, [ user, userData, dispatch ] );

	return (
		<div className="gravatar-hovercard">
			<div className="gravatar-hovercard__inner">
				<div className="gravatar-hovercard__header">
					<Gravatar user={ userData } className="gravatar-hovercard__avatar-link" />
					<h4 className="gravatar-hovercard__name">{ userData?.display_name }</h4>
					<p className="gravatar-hovercard__description">{ userData?.bio }</p>
				</div>
				<div className="gravatar-hovercard__body">SUBSCRIBE</div>

				<div className="gravatar-hovercard__footer">REC BLOGS</div>
			</div>
		</div>
	);
}
