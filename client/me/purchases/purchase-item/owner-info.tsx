import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { Purchase } from 'calypso/lib/purchases/types';
import { useIsUserPurchaseOwner } from 'calypso/state/purchases/utils';

type OwnProps = {
	purchase: Purchase;
};

const OwnerInfo: React.FC< OwnProps > = ( { purchase } ) => {
	const translate = useTranslate();
	const isCurrentUserPurchaseOwner = useIsUserPurchaseOwner();

	return isCurrentUserPurchaseOwner( purchase ) ? null : (
		<InfoPopover className="owner-info__pop-over" showOnHover>
			<span>
				{ translate(
					'To manage this subscription, log in to the WordPress.com account that purchased it or contact the owner.'
				) }
			</span>
		</InfoPopover>
	);
};

export default OwnerInfo;
