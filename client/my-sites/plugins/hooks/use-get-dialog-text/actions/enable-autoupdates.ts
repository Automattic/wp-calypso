import { translate } from 'i18n-calypso';
import type { ActionTexts, ActionHeadings, ActionMessages } from '../types';

const headings: ActionHeadings = {
	onePlugin: ( translate ) => translate( 'Enable auto-updates for plugin' ),
	manyPlugins: ( plugins ) => ( translate ) =>
		translate(
			'Enable auto-updates for %(pluginCount)d plugin',
			'Enable auto-updates for %(pluginCount)d plugins',
			{
				count: plugins.length,
				args: { pluginCount: plugins.length },
			}
		),
};

const messages: ActionMessages = {
	onePluginOneSite:
		( plugin, { title: site } ) =>
		( translate ) =>
			translate(
				'You are about to enable auto-updates for the %(plugin)s plugin installed on %(site)s.',
				{
					args: {
						plugin: plugin.name ?? plugin.slug,
						site,
					},
				}
			),
	onePluginManySites: ( plugin, sites ) => ( translate ) =>
		translate(
			'You are about to enable auto-updates for the %(plugin)s plugin installed on %(siteCount)d site.',
			'You are about to enable auto-updates for the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugin.name ?? plugin.slug,
					siteCount: sites.length,
				},
			}
		),
	manyPluginsOneSite:
		( plugins, { title: site } ) =>
		( translate ) =>
			translate(
				'You are about to enable auto-updates for %(pluginCount)d plugin installed on %(site)s.',
				'You are about to enable auto-updates for %(pluginCount)d plugins installed on %(site)s.',
				{
					count: plugins.length,
					args: {
						pluginCount: plugins.length,
						site,
					},
				}
			),
	manyPluginsManySites: ( plugins, sites ) => ( translate ) => {
		const pluginsPart = translate(
			'You are about to enable auto-updates for %(pluginCount)d plugin.',
			'You are about to enable auto-updates for %(pluginCount)d plugins.',
			{
				count: plugins.length,
				args: {
					pluginCount: plugins.length,
				},
			}
		);
		const sitesPart = translate(
			'This will impact %(siteCount)d site.',
			'This will impact %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					siteCount: sites.length,
				},
			}
		);

		return `${ pluginsPart } ${ sitesPart }`;
	},
};

const cta = {
	confirm: translate( 'Enable' ),
	cancel: translate( 'Cancel' ),
};

const actionTexts: ActionTexts = {
	headings,
	messages,
	cta,
};

export default actionTexts;
