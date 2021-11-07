import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

export default function FixedNavigationHeaderExample() {
	const navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
	];
	return <FixedNavigationHeader navigationItems={ navigationItems } />;
}
