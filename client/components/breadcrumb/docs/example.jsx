import Breadcrumb from 'calypso/components/breadcrumb';

const BreadcrumbExample = () => {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
		{ label: 'Woocommerce' },
	];

	return (
		<>
			<Breadcrumb items={ [ { label: 'Plugins' } ] } />
			<br />
			<Breadcrumb items={ navigationItems } />
			<br />
			<Breadcrumb items={ navigationItems } mobileItem="Go Back" compact />
		</>
	);
};

BreadcrumbExample.displayName = 'Breadcrumb';

export default BreadcrumbExample;
