import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import CardHeading from 'calypso/components/card-heading';

import './style.scss';

type Props = {
	title: string;
	text: string;
	href: string;
};
const HostingOverview: FC = () => {
	const PromoCard = ( { title, text, href }: Props ) => (
		<Card className="dev-tools-promo__card">
			<CardHeading>{ title }</CardHeading>
			<p>{ text }</p>
			<a href={ href }>{ translate( 'Learn more' ) }</a>
		</Card>
	);
	return (
		<div className="dev-tools-promo">
			<div className="dev-tools-promo__hero">
				<h1> { translate( 'Unlock all developer tools' ) }</h1>
				<p>
					{ translate(
						'Upgrade to the Creator plan or higher to get access to all developer tools'
					) }
				</p>
				<Button variant="primary" className="dev-tools-promo__button" href="">
					{ translate( 'Upgrade now' ) }
				</Button>
				<Button variant="secondary" className="dev-tools-promo__button">
					{ translate( 'Browse plugins' ) }
				</Button>
			</div>
			<div className="dev-tools-promo__cards">
				<PromoCard
					title={ translate( 'Hosting Configuration' ) }
					text={ translate(
						"Optimize your site's performance and security by tailoring your server settings to your specific needs."
					) }
					href="#"
				/>
				<PromoCard
					title={ translate( 'Monitoring' ) }
					text={ translate(
						'Proactively monitor site health, detect issues early, and maintain a smooth user experience with instant alerts.'
					) }
					href="#"
				/>
				<PromoCard
					title={ translate( 'PHP Logs' ) }
					text={ translate(
						'Quickly diagnose and resolve PHP issues with detailed error insights, enhancing site reliability.'
					) }
					href="#"
				/>
				<PromoCard
					title={ translate( 'Server Logs' ) }
					text={ translate(
						'Gain full visibility into server activity, helping you manage traffic and spot security issues early.'
					) }
					href="#"
				/>
				<PromoCard
					title={ translate( 'GitHub Deployments' ) }
					text={ translate(
						'Automate updates from GitHub to streamline workflows, reduce errors, and enable faster deployments.'
					) }
					href="#"
				/>
			</div>
		</div>
	);
};

export default HostingOverview;
