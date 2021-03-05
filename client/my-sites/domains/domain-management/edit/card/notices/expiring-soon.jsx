/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Internal dependencies
 */
import { isExpiringSoon } from 'calypso/lib/domains/utils';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { type as domainTypes } from 'calypso/lib/domains/constants';

function ExpiringSoon( props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const { domain, purchase, isLoadingPurchase, selectedSite } = props;
	const { expiry } = domain;

	if ( ! isExpiringSoon( domain, 30 ) ) {
		return null;
	}

	let noticeText;
	let subscriptionId;
	let customLabel;
	let tracksProps;

	if ( domain.type === domainTypes.MAPPED ) {
		if ( ! domain.currentUserCanManage ) {
			noticeText = translate(
				'{{strong}}The domain mapping will expire{{/strong}} in {{strong}}%(days)s{{/strong}}. Please contact the domain mapping owner %(owner)s to renew it.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						days: moment.utc( expiry ).fromNow( true ),
						owner: domain.owner,
					},
				}
			);
		} else if ( domain.bundledPlanSubscriptionId ) {
			noticeText = translate(
				'Your domain mapping will expire with your plan in {{strong}}%(days)s{{/strong}}. Please renew your plan before it expires or it will stop working.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						days: moment.utc( expiry ).fromNow( true ),
					},
				}
			);
			subscriptionId = domain.bundledPlanSubscriptionId;
			customLabel = translate( 'Renew your plan' );
			tracksProps = { source: 'mapped-domain-status', mapping_status: 'expiring-soon-plan' };
		} else {
			noticeText = translate(
				'Your domain mapping will expire in {{strong}}%(days)s{{/strong}}. Please renew it before it expires or it will stop working.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						days: moment.utc( expiry ).fromNow( true ),
					},
				}
			);
			subscriptionId = domain.subscriptionId;
			customLabel = null;
			tracksProps = { source: 'mapped-domain-status', mapping_status: 'expiring-soon' };
		}
	} else if ( domain.type === domainTypes.REGISTERED ) {
		if ( ! domain.currentUserCanManage ) {
			noticeText = translate(
				'{{strong}}The domain will expire{{/strong}} in {{strong}}%(days)s{{/strong}}. Please contact the domain owner %(owner)s to renew it.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						days: moment.utc( expiry ).fromNow( true ),
						owner: domain.owner,
					},
				}
			);
		} else {
			noticeText = translate(
				'{{strong}}Your domain will expire{{/strong}} in {{strong}}%(days)s{{/strong}}. Please renew it before it expires or it will stop working.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						days: moment.utc( expiry ).fromNow( true ),
					},
				}
			);
			subscriptionId = domain.subscriptionId;
			customLabel = null;
			tracksProps = { source: 'registered-domain-status', mapping_status: 'expiring-soon' };
		}
	}

	return (
		<div>
			<p>{ noticeText }</p>
			{ domain.currentUserCanManage && ( purchase || isLoadingPurchase ) && (
				<RenewButton
					primary={ true }
					purchase={ purchase }
					selectedSite={ selectedSite }
					subscriptionId={ parseInt( subscriptionId, 10 ) }
					customLabel={ customLabel }
					tracksProps={ tracksProps }
				/>
			) }
		</div>
	);
}

export default ExpiringSoon;
