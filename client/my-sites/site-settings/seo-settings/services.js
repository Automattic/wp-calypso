/**
 * Add new Site Verification services to this file.
 * Requires the API endpoint in Jetpack to be updated with the new service too.
 */
export default function ( translate = () => {} ) {
	return [
		{
			name: translate( 'Google' ),
			slug: 'google',
			id: 'google-site-verification',
			link: 'https://www.google.com/webmasters/tools/',
		},
		{
			name: translate( 'Bing' ),
			slug: 'bing',
			id: 'msvalidate.01',
			link: 'https://www.bing.com/webmaster/',
		},
		{
			name: translate( 'Pinterest' ),
			slug: 'pinterest',
			id: 'p:domain_verify',
			link: 'https://pinterest.com/website/verify/',
		},
		{
			name: translate( 'Yandex' ),
			slug: 'yandex',
			id: 'yandex-verification',
			link: 'https://webmaster.yandex.com/sites/',
		},
		{
			name: translate( 'Facebook' ),
			slug: 'facebook',
			id: 'facebook-domain-verification',
			link: 'https://business.facebook.com/settings/',
			minimumJetpackVersion: '9.8-alpha',
		},
	];
}
