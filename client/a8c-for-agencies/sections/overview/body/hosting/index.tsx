import page from '@automattic/calypso-router';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import MigrationOfferV3 from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v3';
import Offering from 'calypso/a8c-for-agencies/components/offering';
import { OfferingItemProps } from 'calypso/a8c-for-agencies/components/offering/types';
import { A4A_MARKETPLACE_HOSTING_WPCOM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import './styles.scss';
import PressableOffering from './pressable-oferring';

const OverviewBodyHosting = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isMigrationOfferExpanded, setIsMigrationOfferExpanded ] = useState( true );

	const actionHandlerCallback = useCallback(
		( section: string, product: string ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_overview_click_open_marketplace', {
					section,
					product,
				} )
			);
		},
		[ dispatch ]
	);

	const wpcom: OfferingItemProps = {
		//translators: Title for the action card
		title: translate( 'WordPress.com' ),
		titleIcon: <WordPressLogo className="a4a-overview-hosting__wp-logo" size={ 24 } />,
		description: translate(
			'From one site to a thousand, build on a platform with perfect uptime, unlimited bandwidth, and the fastest WP Bench score.'
		),
		highlights: [
			translate(
				'Bespoke 28+ location CDN, edge caching, scalable PHP workers, and automated data center failover.'
			),
			translate(
				'Developer tools, from staging sites and access to plugins and themes to SFTP and SSH access, GitHub deployment, WP-CLI, and direct wp-admin access.'
			),
			translate(
				'24/7 expert security team, malware scanning and removal, and DDoS and WAF protection.'
			),
			translate( 'Realtime backups with one-click restores.' ),
			translate( 'Round-the-clock support from WordPress experts.' ),
		],
		// translators: Button navigating to A4A Marketplace
		buttonTitle: translate( 'Explore WordPress.com' ),
		expanded: true,
		actionHandler: () => {
			actionHandlerCallback( 'hosting', 'wordpress.com' );
			page( A4A_MARKETPLACE_HOSTING_WPCOM_LINK );
		},
	};

	return (
		<Offering
			title={ translate( 'Hosting' ) }
			description={ translate(
				'Choose the hosting that suits your needs from our best-in-class offerings.'
			) }
			items={ [ wpcom ] }
		>
			<MigrationOfferV3
				isExpanded={ isMigrationOfferExpanded }
				onToggleView={ () => setIsMigrationOfferExpanded( ( prev ) => ! prev ) }
			/>
			<PressableOffering />
		</Offering>
	);
};

export default OverviewBodyHosting;
