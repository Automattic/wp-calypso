import { localize, useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

type InjectedProps = {
	isProductOwner: boolean;
};

type NeedsProps = {
	purchase: Purchase | undefined;
};

export type OwnerInfoProps = InjectedProps & NeedsProps;

export const OwnerInfo: React.FC< OwnerInfoProps > = ( { isProductOwner } ) => {
	const translate = useTranslate();

	if ( isProductOwner ) {
		return null;
	}

	return (
		<InfoPopover className="owner-Info__pop-over" showOnHover>
			<span>
				{ translate(
					'To manage this subscription, log in to the WordPress.com account that purchased it or contact the owner.'
				) }
			</span>
		</InfoPopover>
	);
};

export default connect< InjectedProps, unknown, NeedsProps, AppState >(
	( state: AppState, { purchase }: NeedsProps ): InjectedProps => {
		const userId = getCurrentUserId( state );
		const isProductOwner = Boolean( purchase && purchase.userId === userId );

		return {
			isProductOwner,
		};
	}
)( localize( OwnerInfo ) );
