import { Fragment, PureComponent } from 'react';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';

export default class FixedNavigationHeaderExample extends PureComponent {
	static displayName = 'FormattedHeaderExample';

	render() {
		return (
			<Fragment>
				<FixedNavigationHeader headerText="This is the header." />
				<FixedNavigationHeader headerText="This is the header with branded font" brandFont />
			</Fragment>
		);
	}
}
