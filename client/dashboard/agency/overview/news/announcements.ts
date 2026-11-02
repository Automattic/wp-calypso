import { __ } from '@wordpress/i18n';
import A4ALogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import VipLogo from 'calypso/assets/images/a8c-for-agencies/events/vip-logo.svg';
import WooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import WordPressLogo from 'calypso/assets/images/a8c-for-agencies/events/wporg-logo-green.svg';
import JetpackLogo from 'calypso/assets/images/icons/jetpack-app-logo.svg';
import type {
	AgencyAnnouncement,
	AgencyAnnouncementCta,
	AgencyAnnouncementLogo,
	AgencyAnnouncementType,
} from '@automattic/api-core';

export type Announcement = AgencyAnnouncement;
export type AnnouncementCta = AgencyAnnouncementCta;
export type AnnouncementType = AgencyAnnouncementType;

/** The preloaded logos an announcement can use, by key. */
export const ANNOUNCEMENT_LOGOS: Record< AgencyAnnouncementLogo, { src: string; alt: string } > = {
	automattic: { src: A4ALogo, alt: __( 'Automattic for Agencies' ) },
	jetpack: { src: JetpackLogo, alt: __( 'Jetpack' ) },
	woo: { src: WooLogo, alt: __( 'WooCommerce' ) },
	pressable: { src: PressableLogo, alt: __( 'Pressable' ) },
	// There's no WordPress.com tile yet; it shares the WordPress mark.
	wordpress_com: { src: WordPressLogo, alt: __( 'WordPress.com' ) },
	wordpress: { src: WordPressLogo, alt: __( 'WordPress' ) },
	vip: { src: VipLogo, alt: __( 'WordPress VIP' ) },
};
