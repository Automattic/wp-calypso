import { useTranslate } from 'i18n-calypso';

const UserLists = (): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="user-stream__lists">
			<h1>{ translate( 'User Lists' ) }</h1>
		</div>
	);
};

export default UserLists;
