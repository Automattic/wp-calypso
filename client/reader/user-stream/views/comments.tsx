import { useTranslate } from 'i18n-calypso';

const UserComments = () => {
	const translate = useTranslate();

	return (
		<div className="user-stream__comments">
			<h1>{ translate( 'User Comments' ) }</h1>
		</div>
	);
};

export default UserComments;
