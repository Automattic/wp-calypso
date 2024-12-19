import { useTranslate } from 'i18n-calypso';

const UserPosts = () => {
	const translate = useTranslate();

	return (
		<div className="user-stream__posts">
			<h1>{ translate( 'User Posts' ) }</h1>
		</div>
	);
};

export default UserPosts;
