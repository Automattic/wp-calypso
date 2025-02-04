import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { Site, Plugin } from '../types';
import { getActionTexts } from './actions';
import { ActionTexts } from './types';

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

/****************************
 * ADDITIONAL NOTE ABOUT THE CASE OF >1 PLUGINS AND >1 SITES:
 *
 * Because GlotPress is not equipped to address a single string that contains
 * more than one countable item, we must split the modal text for these
 * cases into two separate translatable sentences: one to describe the number
 * of plugins that will be affected, and another to describe how many sites
 * will be affected.
 ****************************/

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

const getTranslatableHeading = ( { headings }: ActionTexts, plugins: Plugin[] ) => {
	if ( plugins.length === 1 ) {
		return headings.onePlugin;
	}

	return headings.manyPlugins( plugins );
};

const getTranslatableMessage = ( { messages }: ActionTexts, plugins: Plugin[], sites: Site[] ) => {
	if ( plugins.length > 1 && sites.length > 1 ) {
		return messages.manyPluginsManySites( plugins, sites );
	}

	if ( plugins.length > 1 ) {
		return messages.manyPluginsOneSite( plugins, sites[ 0 ] );
	}

	if ( sites.length > 1 ) {
		return messages.onePluginManySites( plugins[ 0 ], sites );
	}

	return messages.onePluginOneSite( plugins[ 0 ], sites[ 0 ] );
};

const useGetDialogText = () => {
	const translate = useTranslate();

	return useCallback(
		( action: string, plugins: Plugin[], sites: Site[] ) => {
			const actionTexts = getActionTexts( action );
			const affectedSites = getAffectedSites( plugins, sites );

			return {
				heading: getTranslatableHeading( actionTexts, plugins )( translate ),
				message: getTranslatableMessage( actionTexts, plugins, affectedSites )( translate ),
				cta: actionTexts.cta,
			};
		},
		[ translate ]
	);
};

export default useGetDialogText;
