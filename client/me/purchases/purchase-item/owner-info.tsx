import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { Purchase } from '@automattic/api-core';

type OwnProps = {
	purchase: Purchase;
	isTransferredOwnership?: boolean;
};

const OwnerInfo: React.FC< OwnProps > = ( { purchase, isTransferredOwnership = false } ) => {
	const translate = useTranslate();
	const currentUserId = useSelector( getCurrentUserId );

	if ( currentUserId === purchase.user_id ) {
		return null;
	}

	const tooltipContent = isTransferredOwnership ? (
		<span>
			{ translate(
				"This license was activated on {{strong}}%(domain)s{{/strong}} by another user. If you haven't given the license to them on purpose, {{link}}contact our support team{{/link}} for more assistance.",
				{
					args: {
						domain: purchase.domain || purchase.blogname || translate( 'a site' ),
					},
					components: {
						strong: <strong />,
						link: <a href={ JETPACK_CONTACT_SUPPORT } target="_blank" rel="noopener noreferrer" />,
					},
				}
			) }
		</span>
	) : (
		<span>
			{ translate(
				'To manage this subscription, log in to the WordPress.com account that purchased it or contact the owner.'
			) }
		</span>
	);

	return (
		<InfoPopover className="owner-info__pop-over" showOnHover>
			{ tooltipContent }
		</InfoPopover>
	);
};

export default OwnerInfo;
