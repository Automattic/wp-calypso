import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import expiringIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import { getRelativeDayString } from 'calypso/dashboard/utils/datetime';
import { TASK_RENEW_EXPIRED_PLAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { TranslateResult } from 'i18n-calypso';

const Renew = ( { card }: { card: string } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const { data: purchases } = useQuery( {
		...sitePurchasesQuery( siteId ?? 0 ),
		enabled: Boolean( siteId ),
	} );
	const hasExpired = card === TASK_RENEW_EXPIRED_PLAN;

	const planPurchase = purchases?.find(
		( purchase ) => purchase.product_id === site?.plan?.product_id
	);

	const planName = site?.plan?.product_name_short ?? '';
	const expiryText = planPurchase?.expiry_date
		? getRelativeDayString( new Date( planPurchase.expiry_date ), hasExpired ? 'past' : 'upcoming' )
		: '';
	const isOwner = Boolean( site?.plan?.user_is_owner );

	const title = hasExpired
		? translate( 'Reactivate your %(planName)s plan', { args: { planName } } )
		: translate( '%(planName)s plan expiring soon', { args: { planName } } );
	let description: TranslateResult | undefined;
	let actionText: TranslateResult | undefined;
	if ( isOwner && hasExpired ) {
		description = translate(
			'Your %(planName)s plan expired %(timeSinceExpiry)s. Reactivate now to continue enjoying features such as increased storage space, access to expert support, and automatic removal of WordPress.com ads.',
			{
				args: {
					planName,
					timeSinceExpiry: expiryText,
				},
				comment:
					'%(timeSinceExpiry)s is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			}
		);
		actionText = translate( 'Reactivate plan' );
	} else if ( isOwner && ! hasExpired ) {
		description = translate(
			'Your %(planName)s plan expires %(timeUntilExpiry)s. Renew now to continue enjoying features such as increased storage space, access to expert support, and automatic removal of WordPress.com ads.',
			{
				args: {
					planName,
					timeUntilExpiry: expiryText,
				},
				comment: '%(timeUntilExpiry)s is of the form "in [number] [time-period]" i.e. "in 3 days"',
			}
		);
		actionText = translate( 'Renew now' );
	} else if ( ! isOwner && hasExpired ) {
		description = translate(
			'The %(planName)s plan of this site expired %(timeSinceExpiry)s. To reactivate it, since it was purchased by a different WordPress.com account, log in to that account or contact the account owner.',
			{
				args: {
					planName,
					timeSinceExpiry: expiryText,
				},
				comment:
					'%(timeSinceExpiry)s is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			}
		);
		actionText = translate( 'Got it' );
	} else if ( ! isOwner && ! hasExpired ) {
		description = translate(
			'The %(planName)s plan of this site expires %(timeUntilExpiry)s. To renew it, since it was purchased by a different WordPress.com account, log in to that account or contact the account owner.',
			{
				args: {
					planName,
					timeUntilExpiry: expiryText,
				},
				comment: '%(timeUntilExpiry)s is of the form "in [number] [time-period]" i.e. "in 3 days"',
			}
		);
		actionText = translate( 'Got it' );
	}
	const actionProps = isOwner
		? ( { hasAction: true, actionUrl: `/checkout/renew/${ planPurchase?.ID }` } as const )
		: ( { hasAction: false } as const );
	const illustration = hasExpired ? expiredIllustration : expiringIllustration;

	return (
		<Task
			title={ title }
			description={ description }
			actionText={ actionText }
			badgeText={ translate( 'Action required' ) }
			illustration={ illustration }
			isLoading={ ! planPurchase }
			isUrgent={ hasExpired }
			taskId={ card }
			{ ...actionProps }
		/>
	);
};

export default Renew;
