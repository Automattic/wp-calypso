import { Fragment } from 'react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

export default function FixedNavigationHeaderExample() {
	const navigationItems = [
		{ text: this.props.translate( 'Plugins' ), path: `/plugins` },
		{
			text: this.props.translate( 'Search' ),
			path: `/plugins?s=woo`,
		},
	];
	return (
		<Fragment>
			<FixedNavigationHeader navigationItems={ navigationItems } />
			<FixedNavigationHeader navigationItems={ navigationItems } brandFont />
		</Fragment>
	);
}
