import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import { getUserOwnsPurchase } from 'calypso/state/purchases/selectors/get-user-owns-purchase';

type OwnProps = {
	purchaseId?: number;
};

const OwnerInfo: React.FC< OwnProps > = ( { purchaseId } ) => {
	const translate = useTranslate();
	const userOwnsPurchase = useSelector( ( state ) =>
		purchaseId !== undefined ? getUserOwnsPurchase( state, purchaseId ) : false
	);

	return userOwnsPurchase ? null : (
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
