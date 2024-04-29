import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize, LocalizeProps } from 'i18n-calypso';
import PlanStorage from 'calypso/blocks/plan-storage';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteSlug, getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const ExcessiveDiskSpace = ( { translate }: { translate: LocalizeProps[ 'translate' ] } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const canUserUpgrade = useSelector( ( state ) =>
		canCurrentUser( state, selectedSiteId ?? 0, 'manage_options' )
	);
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, selectedSiteId ) ?? '' );

	const planHasTopStorageSpace = isBusinessPlan( sitePlanSlug ) || isEcommercePlan( sitePlanSlug );
	const displayUpgradeLink = canUserUpgrade && ! planHasTopStorageSpace;

	return (
		<div>
			{ translate( 'Your site does not have enough available storage space.' ) }
			<div className="eligibility-warnings__plan-storage-wrapper">
				<PlanStorage siteId={ selectedSiteId }>{ null }</PlanStorage>
			</div>
			{ displayUpgradeLink &&
				translate(
					'Please {{a}}purchase a plan with additional storage{{/a}} or contact our support team for help.',
					{
						components: {
							a: <a href={ `/plans/${ siteSlug }` } />,
						},
					}
				) }
			{ ! displayUpgradeLink && (
				<span>
					{ translate(
						'You can either {{a}}buy additional storage{{/a}} or {{b}}delete media files{{/b}} until you have less than 95% space usage.',
						{
							components: {
								a: <a href={ `/add-ons/${ siteSlug }` } />,
								b: (
									<a
										target="_blank"
										href={ localizeUrl(
											'https://wordpress.com/support/media/#delete-files-from-media'
										) }
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</span>
			) }
		</div>
	);
};
export default localize( ExcessiveDiskSpace );
