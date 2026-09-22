import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { VIPLogo } from '@automattic/components/src/logos/vip-logo';
import {
	Button,
	Modal,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useState } from 'react';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woo.svg';
import wordpressLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/wordpress.svg';
import type { AgencyTierType, RecordTracksEvent } from './types';
import type { AgencyPartnerDirectorySlug } from '@automattic/api-core';
import type { Button as ButtonComponent } from '@wordpress/components';
import type { ComponentProps, ReactNode } from 'react';

const UPLOADS_URL = 'https://automattic.com/wp-content/uploads';
const VIP_UPLOADS_URL = 'https://automattic.wordpress.com/wp-content/uploads';

const BADGE_FILES: Record<
	AgencyPartnerDirectorySlug,
	Partial< Record< AgencyTierType, { name: string; href: string } > >
> = {
	wordpress: {
		'agency-partner': {
			name: __( 'WordPress.com Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_wordpress_partner.zip`,
		},
		'pro-agency-partner': {
			name: __( 'WordPress.com Pro Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_wordpress_pro_partner.zip`,
		},
		'premier-partner': {
			name: __( 'WordPress.com Premier Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/08/agency_tier_wordpresscom_premier_partner.zip`,
		},
	},
	woocommerce: {
		'agency-partner': {
			name: __( 'Woo Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/02/agency_tier_woo_partner.zip`,
		},
		'pro-agency-partner': {
			name: __( 'Woo Pro Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/02/agency_tier_woo_pro_partner.zip`,
		},
		'premier-partner': {
			name: __( 'Woo Premier Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/08/agency_tier_woo_premier_partner.zip`,
		},
	},
	jetpack: {
		'agency-partner': {
			name: __( 'Jetpack Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_jetpack_partner.zip`,
		},
		'pro-agency-partner': {
			name: __( 'Jetpack Pro Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_jetpack_pro_partner.zip`,
		},
		'premier-partner': {
			name: __( 'Jetpack Premier Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/08/agency_tier_jetpack_premier_partner.zip`,
		},
	},
	pressable: {
		'agency-partner': {
			name: __( 'Pressable Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_pressable_partner.zip`,
		},
		'pro-agency-partner': {
			name: __( 'Pressable Pro Agency Partner' ),
			href: `${ UPLOADS_URL }/2024/10/agency_tier_pressable_pro_partner.zip`,
		},
		'premier-partner': {
			name: __( 'Pressable Premier Agency Partner' ),
			href: `${ UPLOADS_URL }/2025/08/agency_tier_pressable_premier_partner.zip`,
		},
	},
	vip: {
		'vip-pro-agency-partner': {
			name: __( 'WordPress VIP Pro Agency Partner' ),
			href: `${ VIP_UPLOADS_URL }/2026/01/agency_tier_vip_vip_pro_partner.zip`,
		},
		'premier-partner': {
			name: __( 'WordPress VIP Premier Agency Partner' ),
			href: `${ VIP_UPLOADS_URL }/2026/01/agency_tier_vip_premier_partner.zip`,
		},
	},
};

// The widest logo (the VIP wordmark), so every badge name lines up.
const LOGO_SLOT_WIDTH = 38;

const BADGE_ICONS: Record< AgencyPartnerDirectorySlug, ReactNode > = {
	wordpress: <img src={ wordpressLogo } alt="" width={ 24 } height={ 24 } />,
	woocommerce: <img src={ wooLogo } alt="" width={ 24 } height={ 24 } />,
	jetpack: <JetpackLogo size={ 24 } />,
	pressable: <img src={ pressableLogo } alt="" width={ 24 } height={ 24 } />,
	vip: <VIPLogo width={ 38 } height={ 17 } />,
};

export interface BadgeDownload {
	product: AgencyPartnerDirectorySlug;
	name: string;
	href: string;
}

function isVipAgencyTier( tierId?: AgencyTierType ) {
	return tierId === 'vip-pro-agency-partner' || tierId === 'premier-partner';
}

/**
 * The badge zips an agency may download: one per partner directory it is
 * listed in, plus the VIP badge for the two invitation-only tiers.
 */
export function getBadgeDownloads(
	directories: AgencyPartnerDirectorySlug[],
	tierId?: AgencyTierType
): BadgeDownload[] {
	if ( ! tierId ) {
		return [];
	}
	const products = isVipAgencyTier( tierId ) ? [ ...directories, 'vip' as const ] : directories;
	return Array.from( new Set( products ) ).flatMap( ( product ) => {
		const file = BADGE_FILES[ product ]?.[ tierId ];
		return file ? [ { product, ...file } ] : [];
	} );
}

export default function DownloadBadges( {
	directories,
	currentAgencyTierId,
	recordTracksEvent = () => {},
	buttonProps = {},
}: {
	directories: AgencyPartnerDirectorySlug[];
	currentAgencyTierId?: AgencyTierType;
	recordTracksEvent?: RecordTracksEvent;
	buttonProps?: ComponentProps< typeof ButtonComponent >;
} ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const badges = getBadgeDownloads( directories, currentAgencyTierId );
	if ( ! badges.length ) {
		return null;
	}

	const openModal = () => {
		setIsModalOpen( true );
		recordTracksEvent( 'calypso_a4a_agency_tier_badges_download_modal_open' );
	};

	const closeModal = () => {
		setIsModalOpen( false );
		recordTracksEvent( 'calypso_a4a_agency_tier_badges_download_modal_close' );
	};

	return (
		<>
			<Button variant="secondary" { ...buttonProps } onClick={ openModal }>
				{ __( 'Download your badges' ) }
			</Button>
			{ isModalOpen && (
				<Modal
					size="medium"
					aria={ { labelledby: 'agency-tier-download-badges-modal-title' } }
					onRequestClose={ closeModal }
					__experimentalHideHeader
				>
					<VStack spacing={ 4 }>
						<HStack justify="space-between" alignment="center">
							<Heading
								id="agency-tier-download-badges-modal-title"
								level={ 1 }
								size={ 20 }
								lineHeight="24px"
								weight={ 500 }
							>
								{ __( 'Download your agency badges' ) }
							</Heading>
							<Button icon={ close } label={ __( 'Close' ) } onClick={ closeModal } />
						</HStack>
						<Text size={ 13 } lineHeight="20px">
							{ __(
								'Impress potential clients by displaying your expertise in Automattic products on your website and materials.'
							) }
						</Text>
						<Heading level={ 2 } size={ 13 } lineHeight="20px" weight={ 500 }>
							{ __( 'Available badges for download:' ) }
						</Heading>
						<VStack spacing={ 1 }>
							{ badges.map( ( badge ) => (
								<HStack
									key={ badge.product }
									justify="space-between"
									spacing={ 4 }
									style={ { minHeight: '50px' } }
								>
									<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
										<span
											style={ {
												display: 'inline-flex',
												justifyContent: 'center',
												flexShrink: 0,
												width: `${ LOGO_SLOT_WIDTH }px`,
											} }
										>
											{ BADGE_ICONS[ badge.product ] }
										</span>
										<Text size={ 15 } lineHeight="24px">
											{ badge.name }
										</Text>
									</HStack>
									<Button
										variant="secondary"
										size="compact"
										href={ badge.href }
										label={ sprintf(
											/* translators: %s is the badge name, e.g. "Woo Pro Agency Partner" */
											__( 'Download %s badges' ),
											badge.name
										) }
										showTooltip={ false }
										onClick={ () =>
											recordTracksEvent(
												'calypso_a4a_agency_tier_badges_download_modal_download_click',
												{ product: badge.product, agency_tier: currentAgencyTierId }
											)
										}
									>
										{ __( 'Download' ) }
									</Button>
								</HStack>
							) ) }
						</VStack>
					</VStack>
				</Modal>
			) }
		</>
	);
}
