import Breadcrumb from 'calypso/components/breadcrumb';

const BreadcrumbExample = () => {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
		{ label: 'Woocommerce' },
	];
	return <Breadcrumb items={ navigationItems } />;
};

BreadcrumbExample.displayName = 'Breadcrumb';

export default BreadcrumbExample;
