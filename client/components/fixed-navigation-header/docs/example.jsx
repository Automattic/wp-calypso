import { Fragment } from 'react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

export default function FixedNavigationHeaderExample() {
	const navigationItems = [
		{ label: this.props.translate( 'Plugins' ), href: `/plugins` },
		{
			label: this.props.translate( 'Search' ),
			href: `/plugins?s=woo`,
		},
	];
	return (
		<Fragment>
			<FixedNavigationHeader navigationItems={ navigationItems } />
			<FixedNavigationHeader navigationItems={ navigationItems } brandFont />
		</Fragment>
	);
}
