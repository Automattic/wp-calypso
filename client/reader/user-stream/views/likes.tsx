import { useTranslate } from 'i18n-calypso';

const UserLikes = () => {
	const translate = useTranslate();

	return (
		<div className="user-stream__likes">
			<h1>{ translate( 'User Likes' ) }</h1>
		</div>
	);
};

export default UserLikes;
