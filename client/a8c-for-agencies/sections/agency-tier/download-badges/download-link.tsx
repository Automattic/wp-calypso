import { JetpackLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import WooLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woo.svg';
import WordPressogo from 'calypso/assets/images/a8c-for-agencies/product-logos/wordpress.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
	const dispatch = useDispatch();

	const productData: Record<
		string,
		Record< string, { name: string; href: string; icon: JSX.Element } >
	> = {
		wordpress: {
			'agency-partner': {
				name: translate( 'WordPress.com Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_wordpress_partner.zip',
				icon: <img src={ WordPressogo } alt="WordPress.com" />,
			},
			'pro-agency-partner': {
				name: translate( 'WordPress.com Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_wordpress_pro_partner.zip',
				icon: <img src={ WordPressogo } alt="WordPress.com" />,
			},
		},
		woocommerce: {
			'agency-partner': {
				name: translate( 'Woo Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_woo_partner.zip',
				icon: <img src={ WooLogo } alt="WooCommerce" />,
			},
			'pro-agency-partner': {
				name: translate( 'Woo Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_woo_pro_partner.zip',
				icon: <img src={ WooLogo } alt="WooCommerce" />,
			},
		},
		jetpack: {
			'agency-partner': {
				name: translate( 'Jetpack Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_jetpack_partner.zip',
				icon: <JetpackLogo size={ 32 } />,
			},
			'pro-agency-partner': {
				name: translate( 'Jetpack Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_jetpack_pro_partner.zip',
				icon: <JetpackLogo size={ 32 } />,
			},
		},
		pressable: {
			'agency-partner': {
				name: translate( 'Pressable Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_pressable_partner.zip',
				icon: <img src={ PressableLogo } alt="Pressable" />,
			},
			'pro-agency-partner': {
				name: translate( 'Pressable Pro Agency Partner' ),
				href: 'https://automattic.com/wp-content/uploads/2024/10/agency_tier_pressable_pro_partner.zip',
				icon: <img src={ PressableLogo } alt="Pressable" />,
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
		<Button
			href={ data.href }
			onClick={ () => {
				dispatch(
					recordTracksEvent( 'calypso_a8c_agency_tier_badges_download_modal_download_click', {
						product,
						agency_tier: currentAgencyTier,
					} )
				);
			} }
		>
			{ data.icon }
			{ data.name }
		</Button>
	);
}

export default DownloadLink;
