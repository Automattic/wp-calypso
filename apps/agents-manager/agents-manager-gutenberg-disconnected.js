/**
 * Gutenberg disconnected variant entry point.
 *
 * This lightweight variant is used when:
 * - The unified experience is disabled
 * - The help center icon needs to be displayed in the Gutenberg editor
 * - Full Agents Manager functionality is not needed
 *
 * Registers a Gutenberg plugin that adds a help icon button to the editor.
 * The button links directly to the help center URL.
 */

/* global agentsManagerData */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Fill } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { createElement } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Simple help icon SVG component
 */
function HelpIcon() {
	return createElement(
		'svg',
		{
			className: 'agents-manager__help-icon',
			width: '24',
			height: '24',
			viewBox: '0 0 24 24',
			xmlns: 'http://www.w3.org/2000/svg',
		},
		createElement( 'path', {
			d: 'M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z',
		} )
	);
}

/**
 * Help center button component
 */
function AgentsManagerHelpButton() {
	const isDesktop = useMediaQuery( '(min-width: 480px)' );

	// Get help center URL from inline data or use default
	const helpCenterUrl =
		typeof agentsManagerData !== 'undefined' && agentsManagerData?.helpCenterUrl
			? agentsManagerData.helpCenterUrl
			: 'https://wordpress.com/help';

	const handleClick = () => {
		recordTracksEvent( 'calypso_inlinehelp_show', {
			force_site_id: true,
			location: 'help-center',
			section: 'gutenberg',
		} );
	};

	const button = createElement( Button, {
		className: 'agents-manager-help-center',
		href: helpCenterUrl,
		icon: createElement( HelpIcon ),
		label: 'Help',
		size: 'compact',
		target: '_blank',
		rel: 'noopener noreferrer',
		onClick: handleClick,
	} );

	// Only render on desktop
	if ( ! isDesktop ) {
		return null;
	}

	// Use Fill to add button to PinnedItems slot
	return createElement( Fill, { name: 'PinnedItems/core' }, button );
}

// Register the plugin
registerPlugin( 'agents-manager-help-center', {
	render: AgentsManagerHelpButton,
} );
