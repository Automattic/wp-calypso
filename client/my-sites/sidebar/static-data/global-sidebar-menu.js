import { category, Icon } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

/**
 * Menu items that support all sites screen.
 */
export default function globalSidebarMenu() {
	return [
		{
			icon: <Icon icon={ category } className="sidebar__menu-icon svg_all-sites" size={ 24 } />,
			slug: 'sites',
			title: translate( 'Sites' ),
			navigationLabel: translate( 'Manage all my sites' ),
			type: 'menu-item',
			url: '/sites',
		},
		{
			icon: 'dashicons-admin-site-alt3',
			slug: 'domains',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'Manage all domains' ),
			type: 'menu-item',
			url: '/domains/manage',
		},
		{
			icon: (
				<svg
					className="sidebar__menu-icon sidebar_svg-reader"
					fill="none"
					height="24"
					viewBox="4 4 24 24"
					width="24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<clipPath id="readerIconSidebarFooter">
						<path d="m4 11.2002h24v10.2857h-24z"></path>
					</clipPath>
					<g clipPath="url(#readerIconSidebarFooter)">
						<path d="m4.94437 16.8443-.94437-.0656v-1.4979l1.05696-.0515c.73758-2.4238 2.27248-3.924 4.78852-4.0248 2.48152-.0961 4.13592 1.2541 5.05502 3.6099.3317-.1946.7077-.297 1.0903-.297s.7586.1024 1.0903.297c.9604-2.3863 2.6355-3.7505 5.1722-3.6005 2.4632.1406 3.9591 1.6408 4.6828 4.0177l1.057.0492v1.444c-.0528.0304-.0873.0726-.1149.0679-.6893-.1054-.9007.211-1.0615.8861-.586 2.4589-2.7872 3.9732-5.3538 3.7927-2.2977-.1618-4.2302-2.1097-4.5381-4.5475-.0359-.2323-.1505-.4444-.3239-.5995-.1734-.155-.3945-.2431-.625-.249-.2239.01-.4376.0984-.6051.2505-.1674.152-.2783.3582-.314.5839-.3332 2.5785-2.3506 4.4983-4.8115 4.5756-2.60796.0821-4.67824-1.608-5.20213-4.245-.01149-.1313-.05974-.2509-.0988-.3962zm5.05505 3.0942c.93708.0075 1.83898-.3643 2.50778-1.034.6689-.6696 1.0503-1.5824 1.0606-2.5384.0049-.9553-.3621-1.8736-1.0204-2.5531s-1.5541-1.0646-2.4905-1.0708c-.93734-.0075-1.83926.3647-2.50784 1.0349s-1.04921 1.5836-1.05831 2.5398c-.00302.4737.08568.9433.261 1.382.17532.4386.43381.8376.76065 1.1741s.7156.6038 1.14397.7866c.42836.1829.88789.2776 1.35223.2789zm11.96208 0c.9375 0 1.8366-.3798 2.4997-1.0558.6631-.6761 1.0359-1.593 1.0365-2.5494-.0048-.956-.381-1.871-1.046-2.5446-.665-.6735-1.5646-1.0507-2.5017-1.0488-.9374 0-1.8366.3797-2.4997 1.0557-.6631.6761-1.0359 1.5931-1.0365 2.5494.0021.4744.0958.9437.2757 1.3811s.4424.8344.7727 1.1683.7219.5982 1.1523.7777c.4304.1796.8912.2709 1.3562.2687z"></path>
					</g>
				</svg>
			),
			slug: 'reader',
			title: translate( 'Reader' ),
			navigationLabel: translate( 'Reader' ),
			type: 'menu-item',
			url: '/read',
			forceChevronIcon: true,
		},
	];
}
