import { Fragment } from 'react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

export default function FixedNavigationHeaderExample() {
	return (
		<Fragment>
			<FixedNavigationHeader headerText="This is the header." />
			<FixedNavigationHeader headerText="This is the header with branded font" brandFont />
		</Fragment>
	);
}
