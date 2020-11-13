/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_RENEW_EXPIRED_PLAN } from 'calypso/my-sites/customer-home/cards/constants';
import expiredIllustration from 'calypso/assets/images/customer-home/disconnected-dark.svg';
import expiringIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

const Renew = ( { card, moment, purchases, site, siteSlug } ) => {
	const translate = useTranslate();
	const hasExpired = card === TASK_RENEW_EXPIRED_PLAN;

	const planPurchase = purchases.find(
		( purchase ) => purchase.productId === site?.plan.product_id
	);

	const planName = site?.plan.product_name_short;
	const planSlug = planPurchase?.productSlug;
	const expiry = moment( planPurchase?.expiryDate );
	const expiryToday = Math.abs( moment().diff( expiry, 'hours' ) ) < 24;
	const expiryText = expiryToday ? expiry.format( '[today]' ) : expiry.fromNow();
	const isOwner = site?.plan.user_is_owner;

	const title = hasExpired
		? translate( 'Reactivate your %(planName)s plan', { args: { planName } } )
		: translate( '%(planName)s plan expiring soon', { args: { planName } } );
	let description;
	let actionText;
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
	const actionUrl = isOwner
		? `/checkout/${ planSlug }/renew/${ planPurchase?.id }/${ siteSlug }`
		: null;
	const illustration = hasExpired ? expiredIllustration : expiringIllustration;

	return (
		<Task
			title={ title }
			description={ description }
			actionText={ actionText }
			actionUrl={ actionUrl }
			badgeText={ translate( 'Action required' ) }
			illustration={ illustration }
			isLoading={ ! planPurchase }
			isUrgent={ hasExpired }
			hasAction={ isOwner }
			taskId={ card }
		/>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		purchases: getSitePurchases( state, siteId ),
		site: getSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( withLocalizedMoment( Renew ) );
