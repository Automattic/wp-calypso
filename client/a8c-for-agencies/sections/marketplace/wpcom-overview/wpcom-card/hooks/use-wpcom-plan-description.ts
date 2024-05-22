import { useTranslate } from 'i18n-calypso';

export default function useWPCOMPlanDescription( slug: string ) {
	const translate = useTranslate();

	let name = slug;
	let features1: string[] = [];
	let features2: string[] = [];

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
			translate( 'Expert live chat & email support' ),
			translate( 'DDOS mitigation' ),
			translate( 'Free staging environment' ),
			translate( 'Isolated site infrastructure' ),
			translate( 'Malware detection & removal' ),
			translate( 'SFTP/SSH, WP-CLI, Git tools' ),
			translate( 'Extremely fast DNS with SSL' ),
			translate( 'Centralized site management' ),
		];
	}

	return {
		name,
		features1,
		features2,
	};
}
