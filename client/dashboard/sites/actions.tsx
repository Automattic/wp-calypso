import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, wordpress } from '@wordpress/icons';
import AsyncLoad from 'calypso/components/async-load';
import { isP2, isSelfHostedJetpackConnected } from '../utils/site-types';
import { canManageSite } from './features';
import type { Site } from '../data/types';
import type { Action, RenderModalProps } from '@automattic/dataviews';
import type { AnyRouter } from '@tanstack/react-router';

export function getActions( router: AnyRouter ): Action< Site >[] {
	return [
		{
			id: 'admin',
			isPrimary: true,
			icon: <Icon icon={ wordpress } />,
			label: __( 'WP admin ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				if ( site.options?.admin_url ) {
					window.open( site.options.admin_url, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.options?.admin_url ? false : true ),
		},
		{
			id: 'site',
			label: __( 'Visit site ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				if ( site.URL ) {
					window.open( site.URL, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.URL ? false : true ),
		},
		{
			id: 'domains',
			label: __( 'Domains ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				window.open( `/domains/manage/${ site.slug }` );
			},
			isEligible: ( item: Site ) => canManageSite( item ),
		},
		{
			id: 'prepare-for-launch',
			label: __( 'Prepare for launch' ),
			callback: ( sites ) => {
				const site = sites[ 0 ];
				router.navigate( {
					to: '/sites/$siteSlug/settings/site-visibility',
					params: { siteSlug: site.slug },
				} );

				recordTracksEvent( 'calypso_sites_dashboard_site_action_prepare_for_launch_click' );
			},
			isEligible: ( item: Site ) =>
				canManageSite( item ) &&
				item.is_a4a_dev_site &&
				! item.is_wpcom_staging_site &&
				item.launch_status === 'unlaunched',
		},
		{
			id: 'settings',
			label: __( 'Settings' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				router.navigate( { to: '/sites/$siteSlug/settings', params: { siteSlug: site.slug } } );
			},
			isEligible: ( item: Site ) => canManageSite( item ),
		},
		{
			id: 'restore',
			isPrimary: true,
			icon: backup,
			label: __( 'Restore site' ),
			isEligible: ( item: Site ) =>
				item.is_deleted && ! isP2( item ) && ! isSelfHostedJetpackConnected( item ),
			RenderModal: ( { items, closeModal }: RenderModalProps< Site > ) => {
				return (
					<AsyncLoad
						require="./site-restore-modal/content-info"
						placeholder={ null }
						site={ items[ 0 ] }
						onClose={ closeModal }
					/>
				);
			},
		},
		{
			id: 'leave',
			label: __( 'Leave site' ),
			isEligible: ( item: Site ) => ! item.is_deleted && ! isP2( item ),
			RenderModal: ( { items, closeModal }: RenderModalProps< Site > ) => {
				return (
					<AsyncLoad
						require="./site-leave-modal/content-info"
						placeholder={ null }
						site={ items[ 0 ] }
						onClose={ closeModal }
					/>
				);
			},
		},
	];
}
