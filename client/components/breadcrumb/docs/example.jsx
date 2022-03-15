import Breadcrumb from 'calypso/components/breadcrumb';

const BreadcrumbExample = () => {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
		{ label: 'Woocommerce' },
	];
	const mobileItem = {
		label: 'Back',
		href: navigationItems[ navigationItems.length - 2 ].href,
		showBackArrow: true,
	};

	return <Breadcrumb items={ navigationItems } mobileItem={ mobileItem } />;
};

BreadcrumbExample.displayName = 'Breadcrumb';

export default BreadcrumbExample;
