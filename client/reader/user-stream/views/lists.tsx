import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

const UserLists = (): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="user-profile__lists">
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ formatListBullets } size={ 48 } /> }
				title={ null }
				line={ translate( 'No lists yet.' ) }
			/>
		</div>
	);
};

export default UserLists;
