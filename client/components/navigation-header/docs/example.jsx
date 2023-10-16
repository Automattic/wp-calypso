import { Button } from '@automattic/components';
import { Component } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';

class NavigationHeaderExample extends Component {
	navigationItems = [
		{ label: 'Plugins', href: `/plugins` },
		{ label: 'Search', href: `/plugins?s=woo` },
	];
	state = {
		page: 1,
		compact: false,
	};

	updatePage = ( page ) => {
		this.setState( { page } );
	};

	toggleCompact = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		return (
			<div>
				<NavigationHeader
					compactBreadcrumb={ this.state.compact }
					navigationItems={ [] }
					mobileItem={ null }
					title="My Home"
					subtitle="Your hub for posting, editing, and growing your site."
				>
					<Button target="_blank">Visit site</Button>
				</NavigationHeader>

				<NavigationHeader
					compactBreadcrumb={ this.state.compact }
					navigationItems={ [
						{ label: 'Domains', href: `/domains` },
						{
							label: 'thisisanexample.wordpress.com',
							href: `/domains/thisisanexample.wordpress.com`,
						},
						{
							label: 'Transfer',
							href: `/domains/thisisanexample.wordpress.com/transfer`,
						},
					] }
					mobileItem={ null }
					title="Title example"
					subtitle="Subtitle example"
				></NavigationHeader>
			</div>
		);
	}
}
NavigationHeaderExample.displayName = 'NavigationHeaderExample';

export default NavigationHeaderExample;
