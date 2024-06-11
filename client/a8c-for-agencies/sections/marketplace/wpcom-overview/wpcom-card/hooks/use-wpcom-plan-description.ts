import { useTranslate } from 'i18n-calypso';

export default function useWPCOMPlanDescription( slug: string ) {
	const translate = useTranslate();

	let name = slug;
	let features1: string[] = [];
	let features2: string[] = [];
	let jetpackFeatures1: string[] = [];
	let jetpackFeatures2: string[] = [];

	// FIXME: Need to have correct slug. Right now we use whatever we have.
	if ( slug === 'wpcom-hosting-business' ) {
		name = translate( 'WordPress.com' );
		features1 = [
			translate( '50GB of storage' ),
			translate( 'Unrestricted bandwidth' ),
			translate( 'Global CDN with 28+ locations' ),
			translate( 'Install your own plugins & themes' ),
			translate( 'Global edge caching' ),
			translate( 'High-burst capacity' ),
			translate( 'Web Application Firewall' ),
			translate( 'High-frequency CPUs' ),
			translate( 'Automated datacenter failover' ),
		];

		features2 = [
			translate( 'Priority support 24/7' ),
			translate( 'DDOS mitigation' ),
			translate( 'Free staging environment' ),
			translate( 'Isolated site infrastructure' ),
			translate( 'Malware detection & removal' ),
			translate( 'SFTP/SSH, WP-CLI, Git tools' ),
			translate( 'Extremely fast DNS with SSL' ),
			translate( 'Centralized site management' ),
		];

		jetpackFeatures1 = [
			translate( 'Real-time backups' ),
			translate( 'One-click restores' ),
			translate( 'Uptime monitor' ),
			translate( 'Built-in Elasticsearch' ),
			translate( 'Plugin auto-updates' ),
		];

		jetpackFeatures2 = [
			translate( 'SEO and analytics tools' ),
			translate( '4K video support with VideoPress' ),
			translate( 'Unlimited automatic social media shares' ),
			translate( 'Site activity log' ),
			translate( 'Detailed analytics dashboard' ),
		];
	}

	return {
		name,
		features1,
		features2,
		jetpackFeatures1,
		jetpackFeatures2,
	};
}
