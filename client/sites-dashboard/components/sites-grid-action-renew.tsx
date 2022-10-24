import { recordTracksEvent } from '@automattic/calypso-analytics';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useInView } from 'calypso/lib/use-in-view';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { PLAN_RENEW_EVENT_NAMES } from '../utils';
import { SitesGridAction } from './sites-grid-action';

interface SitesGridActionRenewProps {
	site: SiteExcerptData;
}
export function SitesGridActionRenew( { site }: SitesGridActionRenewProps ) {
	const { __ } = useI18n();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const isSiteOwner = site.site_owner === userId;

	const trackCallback = useCallback( () => {
		recordTracksEvent( PLAN_RENEW_EVENT_NAMES.IN_VIEW, {
			is_site_owner: isSiteOwner,
			product_slug: site.plan?.product_slug,
			display_mode: 'grid',
		} );
	}, [ isSiteOwner, site.plan?.product_slug ] );

	const ref = useInView< HTMLSpanElement >( trackCallback );

	return (
		<SitesGridAction
			icon="notice"
			ctaProps={
				isSiteOwner && {
					title: __( 'Renew' ),
					href: `/checkout/${ site.slug }/${ site.plan?.product_slug }`,
					onClick: () => {
						recordTracksEvent( PLAN_RENEW_EVENT_NAMES.ON_CLICK, {
							product_slug: site.plan?.product_slug,
							display_mode: 'grid',
						} );
					},
				}
			}
		>
			<span ref={ ref }>
				{
					/* translators: %s - the plan's product name, such as Business or Pro. */
					sprintf( __( '%s Plan expired.' ), site.plan?.product_name_short )
				}
			</span>
		</SitesGridAction>
	);
}
