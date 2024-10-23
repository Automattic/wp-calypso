import { JetpackLogo, WooLogo, WordPressLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import type { DirectoryApplicationType } from '../../partner-directory/types';
import type { AgencyTier } from '../types';

function DownloadLink( {
	product,
	currentAgencyTier,
}: {
	product: DirectoryApplicationType;
	currentAgencyTier: AgencyTier;
} ) {
	const translate = useTranslate();

	const productData: Record<
		string,
		Record< string, { name: string; href: string; icon: JSX.Element } >
	> = {
		wordpress: {
			'agency-partner': {
				name: translate( 'WordPress.com Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_wordpress_partner.zip',
				icon: <WordPressLogo />,
			},
			'pro-agency-partner': {
				name: translate( 'WordPress.com Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_wordpress_pro_partner.zip',
				icon: <WordPressLogo />,
			},
		},
		woocommerce: {
			'agency-partner': {
				name: translate( 'Woo Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_woo_partner.zip',
				icon: <WooLogo className="download-badges__woo-logo" />,
			},
			'pro-agency-partner': {
				name: translate( 'Woo Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_woo_pro_partner.zip',
				icon: <WooLogo className="download-badges__woo-logo" />,
			},
		},
		jetpack: {
			'agency-partner': {
				name: translate( 'Jetpack Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_jetpack_partner.zip',
				icon: <JetpackLogo />,
			},
			'pro-agency-partner': {
				name: translate( 'Jetpack Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_jetpack_pro_partner.zip',
				icon: <JetpackLogo />,
			},
		},
		pressable: {
			'agency-partner': {
				name: translate( 'Pressable Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_pressable_partner.zip',
				icon: <img src={ pressableIcon } alt="Pressable" />,
			},
			'pro-agency-partner': {
				name: translate( 'Pressable Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_pressable_pro_partner.zip',
				icon: <img src={ pressableIcon } alt="Pressable" />,
			},
		},
	};

	const data =
		currentAgencyTier &&
		productData[ product ]?.[
			currentAgencyTier as keyof ( typeof productData )[ DirectoryApplicationType ]
		];

	if ( ! data ) {
		return null;
	}

	return (
		<Button href={ data.href }>
			{ data.icon }
			{ data.name }
		</Button>
	);
}

export default DownloadLink;
