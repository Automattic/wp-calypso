import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { preventWidows } from 'calypso/lib/formatting';
import iconCloud from './icons/icon-cloud.svg';
import iconComments from './icons/icon-comments.svg';
import iconPHP from './icons/icon-php.svg';
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
			price={ [ 32, 25 ] }
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

	return [
		{
			title: translate( 'SFTP & Database Access' ),
			description: translate(
				`Access and edit your website's files directly by creating SFTP credentials and using an SFTP client`
			),
			icon: iconCloud,
		},
		{
			title: translate( 'CLI Access' ),
			description: translate( 'Get on the Command Line Interface and perform high level tasks' ),
			icon: iconTerminal,
		},
		{
			title: translate( 'SSH' ),
			description: translate(
				'Enable SSH to perform advanced site operations using the command line'
			),
			icon: iconSSH,
		},
		{
			title: translate( 'Pick Your Datacenter' ),
			description: translate(
				'Select and change where you want to host your WordPress.com website'
			),
			icon: iconServerRacks,
		},
		{
			title: translate( 'PhpMyAdmin' ),
			description: translate(
				"Be able to dive deep into your website's database columns and SQL tables"
			),
			icon: iconPHP,
		},
		{
			title: translate( 'Live Support' ),
			description: translate(
				'Either have questions or need help, get instant support from our Happiness Engineers'
			),
			icon: iconComments,
		},
	];
}
