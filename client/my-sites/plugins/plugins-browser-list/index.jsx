import { Card } from '@automattic/components';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import AsyncLoad from 'calypso/components/async-load';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import PluginsResultsHeader from 'calypso/my-sites/plugins/plugins-results-header';
import { PluginsBrowserListVariant } from './types';
import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;

const PluginsBrowserList = ( {
	plugins,
	variant = PluginsBrowserListVariant.Fixed,
	title,
	subtitle,
	resultCount,
	extended,
	showPlaceholders,
	site,
	currentSites,
	listName,
	listType,
	browseAllLink,
	size,
	search,
	noHeader = false,
} ) => {
	const extendedVariant = extended
		? PluginsBrowserElementVariant.Extended
		: PluginsBrowserElementVariant.Compact;

	const renderPluginsViewList = () => {
		const pluginsViewsList = plugins.map( ( plugin, n ) => {
			// Needs a beter fix but something is leaking empty objects into this list.
			if ( ! plugin?.slug ) {
				return null;
			}
			return (
				<PluginBrowserItem
					site={ site }
					key={ plugin.slug + n }
					gridPosition={ n + 1 }
					plugin={ plugin }
					currentSites={ currentSites }
					listName={ listName }
					listType={ listType }
					variant={ extendedVariant }
					search={ search }
				/>
			);
		} );

		if ( size ) {
			return pluginsViewsList.slice( 0, size );
		}

		return pluginsViewsList;
	};

	const renderPlaceholdersViews = () => {
		return times( size || DEFAULT_PLACEHOLDER_NUMBER, ( i ) => (
			<PluginBrowserItem
				isPlaceholder
				key={ 'placeholder-plugin-' + i }
				variant={ extendedVariant }
			/>
		) );
	};

	const renderViews = () => {
		if ( ! plugins.length ) {
			return renderPlaceholdersViews();
		}

		switch ( variant ) {
			case PluginsBrowserListVariant.InfiniteScroll:
				if ( showPlaceholders ) {
					return renderPluginsViewList().concat( renderPlaceholdersViews() );
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Paginated:
				if ( showPlaceholders ) {
					return renderPlaceholdersViews();
				}
				return renderPluginsViewList();
			case PluginsBrowserListVariant.Fixed:
			default:
				return renderPluginsViewList();
		}
	};

	return (
		<div className="plugins-browser-list">
			{ ! noHeader && ( title || subtitle || resultCount || browseAllLink ) && (
				<PluginsResultsHeader
					title={ title }
					subtitle={ subtitle }
					resultCount={ resultCount }
					browseAllLink={ browseAllLink }
					listName={ listName }
				/>
			) }
			{ listName === 'paid' && (
				<AsyncLoad
					require="calypso/blocks/jitm"
					template="spotlight"
					placeholder={ null }
					messagePath="calypso:plugins:spotlight"
				/>
			) }
			<Card className="plugins-browser-list__elements">{ renderViews() }</Card>
		</div>
	);
};

PluginsBrowserList.propTypes = {
	plugins: PropTypes.array.isRequired,
	variant: PropTypes.oneOf( Object.values( PluginsBrowserListVariant ) ).isRequired,
	extended: PropTypes.bool,
};

export default PluginsBrowserList;
