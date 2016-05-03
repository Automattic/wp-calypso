import menuItemPlugin from './menu-item-plugin';

import InstagramShortcodeWizard from 'post-editor/wizards/instagram';

export const InstagramShortCodePlugin = menuItemPlugin( {
	Wizard: InstagramShortcodeWizard,
	buttonName: 'wpcom_add_instagram',
	commandName: 'wpcomAddInstagramShortcode',
	pluginSlug: 'wpcom/instagramshortcode',
} );

export default InstagramShortCodePlugin;
