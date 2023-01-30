import { FEATURE_SFTP, PLAN_BUSINESS } from '@automattic/calypso-products';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import i18n, { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { preventWidows } from 'calypso/lib/formatting';
import iconCloud from './icons/icon-cloud.svg';
import iconComments from './icons/icon-comments.svg';
import iconDatabase from './icons/icon-database.svg';
import iconServerRacks from './icons/icon-server-racks.svg';
import iconSSH from './icons/icon-ssh.svg';
import iconTerminal from './icons/icon-terminal.svg';
import './style.scss';

interface FeatureListItem {
	title: string;
	description: string;
	icon: string;
}

export function HostingUpsellNudge( { siteId }: { siteId: number | null } ) {
	const translate = useTranslate();

	const features = useFeatureList();

	return (
		<UpsellNudge
			className="hosting-upsell-nudge"
			compactButton={ false }
			title={ translate( 'Upgrade to the Business plan to access all hosting features:' ) }
			event="calypso_hosting_configuration_upgrade_click"
			href={ `/checkout/${ siteId }/business` }
			callToAction={ translate( 'Upgrade to Business Plan' ) }
			plan={ PLAN_BUSINESS }
			feature={ FEATURE_SFTP }
			showIcon={ true }
			list={ features }
			renderListItem={ ( { icon, title, description }: FeatureListItem ) => (
				<>
					<div className="hosting-upsell-nudge__feature-title">
						<img className="hosting-upsell-nudge__feature-icon" src={ icon } alt="" /> { title }
					</div>
					<div className="hosting-upsell-nudge__feature-description">
						{ preventWidows( description ) }
					</div>
				</>
			) }
		/>
	);
}

function useFeatureList(): FeatureListItem[] {
	const translate = useTranslate();
	const isEn = useIsEnglishLocale();

	return [
		{
			title: translate( 'SFTP' ),
			description:
				isEn ||
				i18n.hasTranslation(
					'Streamline your workflow and edit your files with precision using an SFTP client.'
				)
					? translate(
							'Streamline your workflow and edit your files with precision using an SFTP client.'
					  )
					: translate( `Access and edit your website's files directly using an SFTP client` ),
			icon: iconCloud,
		},
		{
			title: translate( 'CLI Access' ),
			description:
				isEn ||
				i18n.hasTranslation(
					'Use WP-CLI to manage plugins and users, or automate repetitive tasks from your terminal.'
				)
					? translate(
							'Use WP-CLI to manage plugins and users, or automate repetitive tasks from your terminal.'
					  )
					: translate(
							'Use WP-CLI to manage plugins and users, or perform search-and-replace across your site'
					  ),
			icon: iconTerminal,
		},
		{
			title: translate( 'SSH' ),
			description:
				isEn ||
				i18n.hasTranslation( 'Take control of your website’s performance and security using SSH.' )
					? translate( 'Take control of your website’s performance and security using SSH.' )
					: translate( `Work the way you're used to working with SSH access to your website` ),
			icon: iconSSH,
		},
		{
			title: translate( 'Pick Your Data Center' ),
			description:
				isEn ||
				i18n.hasTranslation(
					'Choose a primary data center for your site while still enjoying geo-redundant architecture.'
				)
					? translate(
							'Choose a primary data center for your site while still enjoying geo-redundant architecture.'
					  )
					: translate(
							'Choose a primary data center for your site while still enjoying multi-region redundancy'
					  ),
			icon: iconServerRacks,
		},
		{
			title: translate( 'Database Access' ),
			description:
				isEn ||
				i18n.hasTranslation(
					'Manage your website’s data easily, using phpMyAdmin to inspect tables and run queries.'
				)
					? translate(
							'Manage your website’s data easily, using phpMyAdmin to inspect tables and run queries.'
					  )
					: translate( `Inspect your website's tables and run SQL queries via phpMyAdmin` ),
			icon: iconDatabase,
		},
		{
			title: translate( 'Live Support' ),
			description:
				isEn ||
				i18n.hasTranslation(
					'Whenever you’re stuck, our Happiness Engineers have the answers on hand.'
				)
					? translate( 'Whenever you’re stuck, our Happiness Engineers have the answers on hand.' )
					: translate(
							'Either have questions or need help, get instant support from our Happiness Engineers'
					  ),
			icon: iconComments,
		},
	];
}
