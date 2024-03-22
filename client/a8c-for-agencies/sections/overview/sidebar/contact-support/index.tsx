import { Card, JetpackLogo, WordPressLogo, WooCommerceWooLogo } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import FoldableNav from 'calypso/a8c-for-agencies/components/foldable-nav';
import { FoldableNavItem } from 'calypso/a8c-for-agencies/components/foldable-nav/types';
import PressableLogo from 'calypso/a8c-for-agencies/components/pressable-logo';

import './style.scss';

export default function OverviewSidebarContactSupport() {
	const translate = useTranslate();

	const header = translate( 'Contact Support' );
	const tracksName = 'calypso_a4a_overview_contact_support';

	const navItems: FoldableNavItem[] = [
		{
			icon: <JetpackLogo size={ 24 } />,
			link: 'https://jetpack.com/contact-support/',
			slug: 'jetpack',
			id: 'a4a-contact-support-jetpack-icon',
			title: translate( 'Jetpack' ),
			trackEventName: 'calypso_a4a_overview_contact_support_jetpack_click',
			isExternalLink: true,
		},
		{
			icon: <WooCommerceWooLogo width={ 24 } />,
			link: 'https://woo.com/contact-us/',
			slug: 'woocommerce',
			id: 'a4a-contact-support-woocommerce-icon',
			title: translate( 'WooCommerce' ),
			trackEventName: 'calypso_a4a_overview_contact_support_woocommerce_click',
			isExternalLink: true,
		},
		{
			icon: <PressableLogo size={ 18 } />,
			link: 'https://my.pressable.com/',
			slug: 'pressable',
			id: 'a4a-contact-support-pressable-icon',
			title: translate( 'Pressable' ),
			trackEventName: 'calypso_a4a_overview_contact_support_pressable_click',
			isExternalLink: true,
		},
		{
			icon: <WordPressLogo size={ 18 } />,
			link: localizeUrl( 'https://wordpress.com/support/contact/' ),
			slug: 'wordpress',
			id: 'a4a-contact-support-wordpress-icon',
			title: translate( 'WordPress.com' ),
			trackEventName: 'calypso_a4a_overview_contact_support_wordpress_click',
			isExternalLink: true,
		},
	];

	return (
		<Card className="overview__contact-support">
			<FoldableNav
				header={ header }
				navItems={ navItems }
				tracksName={ tracksName }
				expandedInit={ false }
			/>
		</Card>
	);
}
