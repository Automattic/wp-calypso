import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import {
	isSiteOnECommerceTrial as getIsSiteOnECommerceTrial,
	isSiteOnMigrationTrial as getIsSiteOnMigrationTrial,
} from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import TrialUpsellNotice from '../trial-upsell-notice';
export const LaunchSiteTrialUpsellNotice = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isSiteOnECommerceTrial = useSelector( ( state ) =>
		getIsSiteOnECommerceTrial( state, siteId )
	);
	const isSiteOnMigrationTrial = useSelector( ( state ) =>
		getIsSiteOnMigrationTrial( state, siteId )
	);
	const isLaunchable = ! isSiteOnECommerceTrial && ! isSiteOnMigrationTrial;
	if ( isLaunchable ) {
		return null;
	}
	let noticeText;
	if ( isSiteOnECommerceTrial ) {
		noticeText = translate(
			'Before you can share your store with the world, you need to {{a}}pick a plan{{/a}}.',
			{
				components: {
					a: (
						<a
							href={ `/plans/${ siteSlug }` }
							onClick={ this.recordTracksEventForTrialNoticeClick }
						/>
					),
				},
			}
		);
	} else if ( isSiteOnMigrationTrial ) {
		noticeText = translate( 'Ready to launch your site? {{a}}Upgrade to a paid plan{{/a}}.', {
			components: {
				a: (
					<a
						href={ `/plans/${ siteSlug }` }
						onClick={ this.recordTracksEventForTrialNoticeClick }
					/>
				),
			},
		} );
	}

	return noticeText && <TrialUpsellNotice text={ noticeText } />;
};
