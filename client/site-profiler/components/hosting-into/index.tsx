import { translate } from 'i18n-calypso';

export default function HostingInto() {
	return (
		<>
			<h2>{ translate( 'The best WordPress Hosting on the planet' ) }</h2>
			<p>
				{ translate(
					'Whatever you’re building, WordPress.com has everything you need: ' +
						'unmetered bandwidth, unmatched speed, unstoppable security, ' +
						'and intuitive multi-site management.'
				) }
			</p>
			<p>{ translate( 'Bring your WordPress site to WordPress.com and get it all.' ) }</p>
		</>
	);
}
