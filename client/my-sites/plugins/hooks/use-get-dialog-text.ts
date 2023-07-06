import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useCallback } from 'react';
import { Site, Plugin, PluginActionName } from './types';

/****************************
 * NOTE BEFORE READING:
 *
 * Yes, a lot of the code structure in this file is repeated. This is regrettable
 * but purposeful, for a few reasons:
 *
 * 1. Because GlotPress, the translation engine we use, recognizes the work it
 *    needs to by detecting calls to translate and parsing their arguments. To
 *    do its job properly, it needs to see literal (i.e., non-concatenated,
 *    unaffected by variable values) strings. Passing string variables into
 *    `translate` as the first parameter, splitting strings up into segments, or
 *    adding variables in between will confuse both the engine and our (very
 *    human) translators.
 * 2. We're handling four unique, non-overlapping cases and several pre-defined
 *    supported actions/verbs. Each verb needs to have translations written for
 *    each case, and because of reason 1, we can't reuse text among them.
 *
 * For more information, consult the i18n-calypso package's documentation
 * regarding `translate`.
 ****************************/

type DialogText = {
	heading: TranslateResult;
	message: TranslateResult;
};

type DialogTextGetter = (
	translate: ReturnType< typeof useTranslate >,
	plugins: Plugin[],
	sites: Site[]
) => DialogText;

/************************/
/**** ACTIONS: BEGIN ****/
/************************/

// Fallback dialog text, in case we're given an action we haven't written
// translations for yet
const unspecifiedAction: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate( 'Affect %(plugin)s', 'Affect %(pluginCount)d plugins', {
		count: plugins.length,
		args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
	} );

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to affect %(pluginCount)d plugins installed on %(site)s.',
				'You are about to affect %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to affect the %(plugin)s plugin installed on %(site)s.',
			'You are about to affect the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const activate: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate( 'Activate %(plugin)s', 'Activate %(pluginCount)d plugins', {
		count: plugins.length,
		args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
	} );

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to activate %(pluginCount)d plugins installed on %(site)s.',
				'You are about to activate %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to activate the %(plugin)s plugin installed on %(site)s.',
			'You are about to activate the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const deactivate: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate( 'Deactivate %(plugin)s', 'Deactivate %(pluginCount)d plugins', {
		count: plugins.length,
		args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
	} );

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to deactivate %(pluginCount)d plugins installed on %(site)s.',
				'You are about to deactivate %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to deactivate the %(plugin)s plugin installed on %(site)s.',
			'You are about to deactivate the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const remove: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate(
		'Deactivate and remove %(plugin)s',
		'Deactivate and remove %(pluginCount)d plugins',
		{
			count: plugins.length,
			args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
		}
	);

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to deactivate and remove %(pluginCount)d plugins installed on %(site)s.',
				'You are about to deactivate and remove %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to deactivate and remove the %(plugin)s plugin installed on %(site)s.',
			'You are about to deactivate and remove the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const update: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate( 'Update %(plugin)s', 'Update %(pluginCount)d plugins', {
		count: plugins.length,
		args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
	} );

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to update %(pluginCount)d plugins installed on %(site)s.',
				'You are about to update %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to update the %(plugin)s plugin installed on %(site)s.',
			'You are about to update the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const enableAutoUpdates: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate(
		'Enable auto-updates for %(plugin)s',
		'Enable auto-updates for %(pluginCount)d plugins',
		{
			count: plugins.length,
			args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
		}
	);

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to enable auto-updates for %(pluginCount)d plugins installed on %(site)s.',
				'You are about to enable auto-updates for %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to enable auto-updates for the %(plugin)s plugin installed on %(site)s.',
			'You are about to enable auto-updates for the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const disableAutoUpdates: DialogTextGetter = ( translate, plugins, sites ) => {
	const heading = translate(
		'Disable auto-updates for %(plugin)s',
		'Disable auto-updates for %(pluginCount)d plugins',
		{
			count: plugins.length,
			args: { plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug, pluginCount: plugins.length },
		}
	);

	// More than one plugin
	if ( plugins.length > 1 ) {
		return {
			heading,
			message: translate(
				'You are about to disable auto-updates for %(pluginCount)d plugins installed on %(site)s.',
				'You are about to disable auto-updates for %(pluginCount)d plugins installed on %(siteCount)d sites.',
				{
					count: sites.length,
					args: {
						pluginCount: plugins.length,
						site: sites[ 0 ].title,
						siteCount: sites.length,
					},
				}
			),
		};
	}

	// Only one plugin
	return {
		heading,
		message: translate(
			'You are about to disable auto-updates for the %(plugin)s plugin installed on %(site)s.',
			'You are about to disable auto-updates for the %(plugin)s plugin installed on %(siteCount)d sites.',
			{
				count: sites.length,
				args: {
					plugin: plugins[ 0 ].name ?? plugins[ 0 ].slug,
					site: sites[ 0 ].title,
					siteCount: sites.length,
				},
			}
		),
	};
};

const ALL_ACTIONS: Record< PluginActionName, DialogTextGetter > = {
	activate,
	deactivate,
	remove,
	update,
	enableAutoUpdates,
	disableAutoUpdates,
};
const get = ( action: string ) =>
	( ALL_ACTIONS as Record< string, DialogTextGetter > )[ action ] ?? unspecifiedAction;

/************************/
/***** ACTIONS: END *****/
/************************/

const getAffectedSites = ( plugins: Plugin[], sites: Site[] ) => {
	// NOTE: We expect the `sites` parameter not to have any duplicate IDs;
	// if duplicate IDs are present, the returned list of sites will include all
	// duplicates.

	const pluginsInstalledOnSiteIds = new Set(
		plugins
			.map( ( p ) => Object.keys( p.sites ) )
			.flat()
			.map( ( id ) => parseInt( id ) )
	);

	return (
		sites
			// We can't affect any sites that don't allow updating files
			.filter( ( { canUpdateFiles } ) => canUpdateFiles )
			.filter( ( s ) => pluginsInstalledOnSiteIds.has( s.ID ) )
	);
};

const useGetDialogText = () => {
	const translate = useTranslate();

	return useCallback(
		( action: string, plugins: Plugin[], sites: Site[] ) => {
			const getDialogText = get( action );
			const affectedSites = getAffectedSites( plugins, sites );

			return getDialogText( translate, plugins, affectedSites );
		},
		[ translate ]
	);
};

export default useGetDialogText;
