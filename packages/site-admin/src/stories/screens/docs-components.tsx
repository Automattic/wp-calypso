/**
 * External dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, useLocation } from '../..';
import { Page } from '../../components';

export function DocsComponents() {
	// Pick the component from the query params
	const { name } = useLocation();

	const components = {
		'components-sidebar-button': {
			title: '<SidebarButton /> component',
			description: __(
				'A specialized compact button component for the sidebar that extends WordPress Button component, maintaining a consistent and customized style for the site admin.',
				'a8c-site-admin'
			),
			linkToStory: '/?path=/story/components-sidebarbutton--default',
		},

		'components-sidebar-navigation-item': {
			title: '<SidebarNavigationItem /> component',
			description: __(
				'A customizable navigation item for the sidebar that supports icons, chevron indicators, and animated transitions. It handles both link and button behaviors with built-in RTL support and navigation state management.',
				'a8c-site-admin'
			),
			linkToStory: '/?path=/story/components-sidebarnavigationitem--default',
		},
		'components-sidebar': {
			title: '<SidebarContent /> component',
			description: __(
				'Renders a sidebar content component with navigation and animation support.',
				'a8c-site-admin'
			),
			linkToStory: '/?path=/story/components-sidebarcontent--default',
		},
		'components-sidebar-navigation-screen': {
			title: '<SidebarNavigationScreen /> component',
			description: __(
				'A comprehensive sidebar screen component that provides a structured layout with header, content, and footer sections. Includes built-in navigation controls, back/exit buttons with RTL support, customizable actions, and animated transitions between screens.',
				'a8c-site-admin'
			),
			linkToStory: '',
		},
		'components-site-hub': {
			title: '<SiteHub /> Component',
			description: __(
				'A top-level navigation component that displays the site title, site icon, and command palette access. It integrates with WordPress Core data to show site information dynamically, supports external linking, and provides keyboard shortcuts for quick navigation.',
				'a8c-site-admin'
			),
			linkToStory: '/?path=/story/components-sitehub--default',
		},
		'components-site-icon': {
			title: '<SiteIcon /> component',
			description: __(
				'A site icon that appears in the page. It displays the site icon and supports external linking.',
				'a8c-site-admin'
			),
			linkToStory: '/?path=/story/components-siteicon--default',
		},
	};

	const component = components[ name as keyof typeof components ];

	if ( ! component ) {
		return (
			<Page title={ __( 'Components list', 'a8c-site-admin' ) }>
				<h1>{  }</h1>
				<div className="screen-content-area">
					{ Object.values( components ).map( ( component ) => (
						<ul key={ component.title }>
							<li>
								<strong>{ component.title }</strong>
								<p>{ component.description }</p>
							</li>
						</ul>
					) ) }
				</div>
				<HStack>
					<Link to="/">{ __( 'Go back to home', 'a8c-site-admin' ) }</Link>
				</HStack>
			</Page>
		);
	}

	return (
		<Page title={ component.title }>
			<p>{ component.description }</p>
			<HStack justify="flex-start" spacing={ 4 }>
				{ component?.linkToStory && (
					<a href={ component.linkToStory }>{ __( 'View story', 'a8c-site-admin' ) }</a>
				) }
				<Link to="/">{ __( 'Go back to home', 'a8c-site-admin' ) }</Link>
			</HStack>
		</Page>
	);
}
