import { useTranslate } from 'i18n-calypso';
import UserItem from 'calypso/components/user';
import type { Owner } from 'calypso/lib/purchases/types';

function PurchaseMetaOwner( { owner }: { owner: Owner | undefined | null } ) {
	const translate = useTranslate();
	if ( ! owner ) {
		return null;
	}

	return (
		<li>
			<em className="manage-purchase__detail-label">{ translate( 'Owner' ) }</em>
			<span className="manage-purchase__detail">
				<UserItem user={ { ...owner, name: owner.display_name } } />
			</span>
		</li>
	);
}

export default PurchaseMetaOwner;
