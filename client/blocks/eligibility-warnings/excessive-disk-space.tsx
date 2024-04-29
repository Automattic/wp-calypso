import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { englishLocales, useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
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
	const locale = useLocale();
	const { hasTranslation } = useI18n();
	const errorMessage =
		englishLocales.includes( locale ) ||
		hasTranslation(
			'Your site does not have enough storage space. To complete this operation, you need to use less than 95% of the space.'
		)
			? translate(
					'Your site does not have enough storage space. To complete this operation, you need to use less than 95% of the space.'
			  )
			: translate( 'Your site does not have enough available storage space.' );

	return (
		<div>
			{ errorMessage }
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
			{ ! displayUpgradeLink && translate( 'Please contact our support team for help.' ) }
		</div>
	);
};
export default localize( ExcessiveDiskSpace );
