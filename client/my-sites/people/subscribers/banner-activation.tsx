import { Card } from '@automattic/components';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import useBannerDismissReducer from 'calypso/my-sites/people/subscribers/hooks/use-banner-dismiss-reducer';
import useSubscriptionBanner from 'calypso/my-sites/people/subscribers/hooks/use-subscription-banner';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function BannerActivation() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const [ bannerState, bannerDispatch ] = useBannerDismissReducer();
	const showSubscriptionBanner = useSubscriptionBanner( site?.ID as number, bannerState.dismissed );

	function onEnableSubscriptionsModule() {
		dispatch( activateModule( site?.ID, 'subscriptions' ) );
	}

	return (
		<>
			{ site?.ID && <QueryJetpackModules siteId={ site.ID } /> }
			{ showSubscriptionBanner && (
				<Card className="people-subscription-banner">
					<Notice
						status="info"
						onRemove={ () => bannerDispatch( { type: 'dismiss', payload: true } ) }
						actions={ [
							{
								label: translate( 'Enable' ),
								className: 'is-compact is-primary',
								onClick: onEnableSubscriptionsModule,
							},
						] }
					>
						<strong>
							{ translate(
								"Activate post and comment subscriptions to ensure your site visitors don't miss a thing"
							) }
						</strong>
					</Notice>
				</Card>
			) }
		</>
	);
}
