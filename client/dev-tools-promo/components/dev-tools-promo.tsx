import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type PromoCardProps = {
	title: string;
	text: string;
	href: string;
};

const DevToolsPromo = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) || '';

	const PromoCard = ( { title, text, href }: PromoCardProps ) => (
		<Card className="dev-tools-promo__card">
			<CardHeading>{ title }</CardHeading>
			<p>{ text }</p>
			<a href={ href }>{ translate( 'Learn more' ) }</a>
		</Card>
	);

	const upgradeLink = `https://wordpress.com/checkout/${ encodeURIComponent( siteSlug ) }/business`;
	const pluginsLink = `https://wordpress.com/plugins/${ encodeURIComponent( siteSlug ) }`;
	return (
		<div className="dev-tools-promo">
			<div className="dev-tools-promo__hero">
				<h1> { translate( 'Unlock all developer tools' ) }</h1>
				<p>
					{ translate(
						'Upgrade to the Creator plan or higher to get access to all developer tools'
					) }
				</p>
				<Button variant="primary" className="dev-tools-promo__button" href={ upgradeLink }>
					{ translate( 'Upgrade now' ) }
				</Button>
				<Button variant="secondary" className="dev-tools-promo__button" href={ pluginsLink }>
					{ translate( 'Browse plugins' ) }
				</Button>
			</div>
			<div className="dev-tools-promo__cards">
				<PromoCard
					title={ translate( 'Hosting Configuration' ) }
					text={ translate(
						"Optimize your site's performance and security by tailoring your server settings to your specific needs."
					) }
					href={ localizeUrl( 'https://wordpress.com/support/hosting-configuration' ) }
				/>
				<PromoCard
					title={ translate( 'Monitoring' ) }
					text={ translate(
						'Proactively monitor site health, detect issues early, and maintain a smooth user experience with instant alerts.'
					) }
					href={ localizeUrl(
						'https://developer.wordpress.com/docs/troubleshooting/site-monitoring/#metrics'
					) }
				/>
				<PromoCard
					title={ translate( 'PHP Logs' ) }
					text={ translate(
						'Quickly diagnose and resolve PHP issues with detailed error insights, enhancing site reliability.'
					) }
					href={ localizeUrl(
						'https://developer.wordpress.com/docs/troubleshooting/site-monitoring/#php-logs-and-webserver-logs'
					) }
				/>
				<PromoCard
					title={ translate( 'Server Logs' ) }
					text={ translate(
						'Gain full visibility into server activity, helping you manage traffic and spot security issues early.'
					) }
					href={ localizeUrl(
						'https://developer.wordpress.com/docs/troubleshooting/site-monitoring/#php-logs-and-webserver-logs'
					) }
				/>
				<PromoCard
					title={ translate( 'GitHub Deployments' ) }
					text={ translate(
						'Automate updates from GitHub to streamline workflows, reduce errors, and enable faster deployments.'
					) }
					href={ localizeUrl(
						'https://developer.wordpress.com/docs/developer-tools/github-deployments/'
					) }
				/>
			</div>
		</div>
	);
};

export default DevToolsPromo;
