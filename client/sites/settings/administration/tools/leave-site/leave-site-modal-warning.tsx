import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

interface Props {
	siteId: number;
	isSiteOwner: boolean;
	hasActiveSubscriptions: boolean;
}

const LeaveSiteModalWarning = ( { siteId, isSiteOwner, hasActiveSubscriptions }: Props ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();
	const transferOwnershipLink = (
		<a
			href={
				isUntangled
					? `/sites/settings/site/${ siteSlug }/transfer-site`
					: `/settings/start-site-transfer/${ siteSlug }?source=`
			}
		/>
	);

	const managePurchaseLink = <a href={ `/purchases/subscriptions/${ siteSlug }` } />;

	if ( isSiteOwner && hasActiveSubscriptions ) {
		return (
			<Notice isDismissible={ false } status="warning">
				{ translate(
					'You must {{transferOwnershipLink}}transfer ownership of this site to a different account{{/transferOwnershipLink}} and {{managePurchaseLink}}cancel any active subscriptions{{/managePurchaseLink}} prior to leave your site.',
					{
						components: {
							transferOwnershipLink,
							managePurchaseLink,
						},
					}
				) }
			</Notice>
		);
	}

	if ( isSiteOwner ) {
		return (
			<Notice isDismissible={ false } status="warning">
				{ translate(
					'You must {{transferOwnershipLink}}transfer ownership of this site to a different account{{/transferOwnershipLink}} prior to leave your site.',
					{
						components: {
							transferOwnershipLink,
						},
					}
				) }
			</Notice>
		);
	}

	if ( hasActiveSubscriptions ) {
		return (
			<Notice isDismissible={ false } status="warning">
				{ translate(
					'You must {{managePurchaseLink}}cancel any active subscriptions{{/managePurchaseLink}} prior to leave your site.',
					{
						components: {
							managePurchaseLink,
						},
					}
				) }
			</Notice>
		);
	}

	return null;
};

export default LeaveSiteModalWarning;
