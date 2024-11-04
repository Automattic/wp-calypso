import { Card } from '@wordpress/components';
import { Icon, copy, key, code, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';

import './style.scss';

function FeatureCard( {
	title,
	icon,
	items,
}: {
	title: string;
	icon: JSX.Element;
	items: string[];
} ) {
	return (
		<Card className="migrations-hosting-features__card">
			<div className="migrations-hosting-features__card-header">
				<Icon icon={ icon } />
				<h2 className="migrations-hosting-features__card-title">{ title }</h2>
			</div>

			<SimpleList className="migrations-hosting-features__card-list" items={ items } />
		</Card>
	);
}

export default function MigrationsHostingFeatures() {
	const translate = useTranslate();
	return (
		<PageSection
			className="migrations-hosting-features"
			heading={ translate( 'Best-in-class WordPress hosting' ) }
			description={ translate(
				'WordPress.com and Pressable are powered by WP Cloud, the only cloud platform optimized for WordPress.'
			) }
		>
			<div className="migrations-hosting-features__cards">
				<FeatureCard
					icon={ copy }
					title={ translate( 'Performance' ) }
					items={ [
						translate( 'Global edge caching' ),
						translate( 'Global CDN with 28+ locations' ),
						translate( 'High-frequency CPUs' ),
						translate( 'High-burst capacity' ),
						translate( 'Automated datacenter failover' ),
						translate( 'Extremely fast DNS with SSL' ),
						translate( '10 PHP workers w/ auto-scaling' ),
						translate( 'Uptime monitoring' ),
					] }
				/>

				<FeatureCard
					icon={ key }
					title={ translate( 'Security' ) }
					items={ [
						translate( 'Real-time backups' ),
						translate( 'Global CDN with 28+ locations' ),
						translate( 'DDOS protection and mitigation' ),
						translate( 'Brute-force protection' ),
						translate( 'Malware detection & removal' ),
						translate( 'Spam protection with Akismet' ),
						translate( 'Web application firewall (WAF)' ),
						translate( 'One-click restores' ),
						translate( 'Automated WordPress updates' ),
						translate( 'Isolated site infrastructure' ),
					] }
				/>

				<FeatureCard
					icon={ code }
					title={ translate( 'Dev Tools' ) }
					items={ [
						translate( 'Local development environment' ),
						translate( 'Free staging site' ),
						translate( 'WP-CLI access' ),
						translate( 'SSH/SFTP access' ),
						translate( 'GitHub deployments' ),
						translate( 'Plugin auto-updates' ),
						translate( 'Centralized site management' ),
						translate( 'Domain management' ),
						translate( 'Site activity log' ),
					] }
				/>

				<FeatureCard
					icon={ plus }
					title={ translate( 'And More!' ) }
					items={ [
						translate( '24/7 priority expert support' ),
						translate( 'Free managed migrations' ),
						translate( 'Install plugins and themes' ),
						translate( 'In-depth site analytics dashboard' ),
						translate( 'Elastic-powered search' ),
						translate( '4K, unbranded VideoPress player' ),
						translate( 'Free domain for one year' ),
						translate( 'Smart redirects' ),
					] }
				/>
			</div>
		</PageSection>
	);
}
