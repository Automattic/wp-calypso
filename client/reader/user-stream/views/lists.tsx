import { formatListBullets, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

interface UserListsProps {
	headerContent: React.ReactNode;
}

const UserLists = ( { headerContent }: UserListsProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<div className="user-stream__lists">
			{ headerContent }
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
