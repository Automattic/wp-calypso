import Breadcrumb from 'calypso/components/breadcrumb';

export default function BreadcrumbExample() {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
		{ label: 'Woocommerce' },
	];
	return <Breadcrumb items={ navigationItems } />;
}
