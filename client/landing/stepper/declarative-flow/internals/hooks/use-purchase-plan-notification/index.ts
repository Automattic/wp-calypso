import { PLAN_FREE, getPlan } from '@automattic/calypso-products';
import { useEffect } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';

const getStorageKey = ( siteId: number ): string => `show-purchase-plan-notification-${ siteId }`;

type UsePurchasePlanNotificationReturn = {
	setShouldShowNotification: ( siteId: number ) => void;
};

/**
 * This hook is used to show a notification when a site is created with the purchase plan
 * The notification is shown only once and is stored in the localStorage
 */
export const usePurchasePlanNotification = (
	siteId?: number,
	sitePlanSlug?: string
): UsePurchasePlanNotificationReturn => {
	const dispatch = useDispatch();
	const { __ } = useI18n();

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		const storageKey = getStorageKey( siteId );
		const shouldShowNotification = localStorage.getItem( storageKey ) === 'true';

		if ( ! sitePlanSlug || sitePlanSlug === PLAN_FREE || ! shouldShowNotification ) {
			return;
		}

		const plan = getPlan( sitePlanSlug );

		dispatch(
			successNotice(
				sprintf(
					/* translators: %(planName)s is the name of the plan, e.g. "Business Plan" */
					__( "You're in! The %(planName)s Plan is now active." ),
					{ planName: plan?.getTitle() || '' }
				)
			)
		);

		// Reset the flag after showing the notification
		localStorage.removeItem( storageKey );
	}, [ dispatch, __, siteId, sitePlanSlug ] );

	const setShouldShowNotification = ( siteId: number ) => {
		localStorage.setItem( getStorageKey( siteId ), 'true' );
	};

	return { setShouldShowNotification };
};
