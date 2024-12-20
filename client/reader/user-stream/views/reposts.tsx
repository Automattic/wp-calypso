import { useTranslate } from 'i18n-calypso';

const UserReposts = () => {
	const translate = useTranslate();

	return (
		<div className="user-stream__reposts">
			<h1>{ translate( 'User Reposts' ) }</h1>
		</div>
	);
};

export default UserReposts;
