import { recordTracksEvent } from '@automattic/calypso-analytics';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useInView } from 'calypso/lib/use-in-view';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { SitesGridAction } from './sites-grid-action';
import { PLAN_RENEW_NAG_IN_VIEW, PLAN_RENEW_NAG_ON_CLICK } from './sites-plan-renew-nag';

interface SitesGridActionRenewProps {
	site: SiteExcerptData;
}
export function SitesGridActionRenew( { site }: SitesGridActionRenewProps ) {
	const { __ } = useI18n();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isSiteOwner = site.site_owner === userId;

	useInView( () => {
		recordTracksEvent( PLAN_RENEW_NAG_IN_VIEW, {
			is_site_owner: isSiteOwner,
			product_slug: site.plan?.product_slug,
			display_mode: 'tile',
		} );
	} );

	return (
		<SitesGridAction
			icon="notice"
			ctaProps={
				isSiteOwner && {
					title: __( 'Renew' ),
					href: `/checkout/${ site.slug }`,
					onClick: () => {
						recordTracksEvent( PLAN_RENEW_NAG_ON_CLICK, {
							product_slug: site.plan?.product_slug,
							display_mode: 'tile',
						} );
					},
				}
			}
		>
			{ createInterpolateElement(
				/* translators: PlanName is the plan's product name, such as Pro or Business */
				__( 'Your <PlanName /> plan has expired' ),
				{
					PlanName: <>{ site.plan?.product_name_short }</>,
				}
			) }
		</SitesGridAction>
	);
}
