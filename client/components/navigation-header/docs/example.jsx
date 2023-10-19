import { translate } from 'i18n-calypso';
import { Component } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import InstallThemeButton from 'calypso/my-sites/themes/install-theme-button';

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
					screenReader="Screen reader example"
				></NavigationHeader>

				<NavigationHeader
					compactBreadcrumb={ false }
					navigationItems={ [] }
					mobileItem={ null }
					title={ translate( 'Themes' ) }
					subtitle={ translate(
						'Select or update the visual design for your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="themes" showIcon={ false } />,
							},
						}
					) }
				>
					<InstallThemeButton />
				</NavigationHeader>
			</div>
		);
	}
}
NavigationHeaderExample.displayName = 'NavigationHeaderExample';

export default NavigationHeaderExample;
