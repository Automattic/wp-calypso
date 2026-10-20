import { __ } from '@wordpress/i18n';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import vipDescriptor from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomDescriptor from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';
import hostHighTrafficVip from './images/host-high-traffic-vip.svg';
import hostPerSiteWpcom from './images/host-per-site-wpcom.svg';
import hostSharedPlanPressable from './images/host-shared-plan-pressable.svg';
import type { HostingSection } from '../paths';

export interface Host {
	key: HostingSection;
	/** The brand name, which is not translated. */
	name: string;
	/** The host's descriptor lockup: its round mark and its name. */
	logo: string;
	tier: string;
	/** Who the host is for: the lead line on its card and the description on its page. */
	bestFor: string;
	art: string;
	includes: string[];
}

export const getHosts = (): Record< HostingSection, Host > => ( {
	wpcom: {
		key: 'wpcom',
		name: 'WordPress.com',
		logo: wpcomDescriptor,
		tier: __( 'Standard Agency Hosting' ),
		bestFor: __( 'Best for small businesses, nonprofits, and direct-to-consumer brands' ),
		art: hostPerSiteWpcom,
		includes: [
			__( '50GB of storage' ),
			__( 'Free staging site' ),
			__( 'Unrestricted bandwidth' ),
			__( 'Global CDN with 28+ locations' ),
			__( 'Real-time backups' ),
			__( '24/7 expert support' ),
		],
	},
	pressable: {
		key: 'pressable',
		name: 'Pressable',
		logo: pressableDescriptor,
		tier: __( 'Premier Agency Hosting' ),
		bestFor: __( 'Designed for top-tier performance, scalability, and reliability' ),
		art: hostSharedPlanPressable,
		includes: [
			__( 'From 1 to 500+ WordPress installs' ),
			__( 'Free staging site' ),
			__( 'Unmetered bandwidth' ),
			__( 'Premium plans up to 10M visits per month' ),
			__( 'Auto-scaling PHP workers' ),
			__( 'Free managed migrations' ),
		],
	},
	vip: {
		key: 'vip',
		name: 'WordPress VIP',
		logo: vipDescriptor,
		tier: __( 'Enterprise' ),
		bestFor: __( 'Best for high-traffic sites and complex digital needs' ),
		art: hostHighTrafficVip,
		includes: [
			__( 'Enterprise-grade security' ),
			__( 'Scalable platform' ),
			__( 'Headless CMS' ),
			__( 'Integrated commerce' ),
			__( 'Development tools' ),
			__( 'Content guidance' ),
		],
	},
} );

/** The order the Hosting page shows the hosts in. */
export const HOST_ORDER: HostingSection[] = [ 'wpcom', 'pressable', 'vip' ];

export const getHost = ( key: HostingSection ) => getHosts()[ key ];
