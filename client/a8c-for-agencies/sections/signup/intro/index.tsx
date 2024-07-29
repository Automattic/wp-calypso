import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import A8cForAgenciesLogo from './logos/a8c-for-agencies.svg';
import JetpackLogo from './logos/jetpack.svg';
import PressableLogo from './logos/pressable.svg';
import VipLogo from './logos/vip.svg';
import WooLogo from './logos/woo.svg';
import WpcomLogo from './logos/wpcom.svg';

import './style.scss';

/**
 * Signup Introduction Content
 * Information for new users coming from the client plugin.
 */
export default function SignupIntro( { wpAdminUrl }: { wpAdminUrl?: string } ) {
	const translate = useTranslate();
	return (
		<div className="a4a-signup-intro">
			<img src={ A8cForAgenciesLogo } alt={ translate( 'Automattic for Agencies' ) } />
			<h1>{ translate( "You haven't signed up yet!" ) }</h1>
			<p>
				{ translate(
					"Automattic for Agencies will help to streamline your agency's operations and amplify your business with our suite of best-in-class products."
				) }
			</p>
			<div className="a4a-signup-intro__logos">
				<img src={ WpcomLogo } alt={ translate( 'WordPress.com' ) } />
				<img src={ WooLogo } alt={ translate( 'WooCommerce' ) } />
				<img src={ JetpackLogo } alt={ translate( 'Jetpack' ) } />
				<img src={ VipLogo } alt={ translate( 'WordPress VIP' ) } />
				<img src={ PressableLogo } alt={ translate( 'Pressable' ) } />
			</div>
			<h4 className="a4a-signup-intro__separator">{ translate( 'Get Access' ) }</h4>
			<p>
				{ translate(
					"The Automattic for Agencies program is open for sign ups. Manage all of your clients' sites and client relationships in one platform. And more!"
				) }
			</p>
			<Button href="https://automattic.com/for/agencies" primary target="_blank">
				{ translate( 'Visit the program website' ) }
			</Button>
			{ wpAdminUrl && (
				<a href={ wpAdminUrl } className="a4a-signup-intro__wp-admin-link">
					{ translate( 'Back to WP-Admin' ) }
				</a>
			) }
		</div>
	);
}
