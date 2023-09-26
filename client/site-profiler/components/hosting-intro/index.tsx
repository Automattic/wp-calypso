import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';

export default function HostingIntro() {
	return (
		<div className="hosting-intro-block l-block-col-2">
			<div className="l-block-content">
				<h2>{ translate( 'The best WordPress Hosting on the planet' ) }</h2>
				<p>
					{ translate(
						'Whatever you’re building, WordPress.com has everything you need: ' +
							'unmetered bandwidth, unmatched speed, unstoppable security, ' +
							'and intuitive multi-site management.'
					) }
				</p>
				<p>{ translate( 'Bring your WordPress site to WordPress.com and get it all.' ) }</p>
				<Button href={ localizeUrl( 'https://wordpress.com/hosting' ) } className="button-action">
					{ translate( 'Learn more' ) }
				</Button>
			</div>
			<div className="l-block-content">
				<img
					src="https://wpcom.files.wordpress.com/2023/08/people-smile.jpg"
					role="presentation"
					alt="Hosting"
				/>
			</div>
		</div>
	);
}
