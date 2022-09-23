import { Card, Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import AsyncLoad from 'calypso/components/async-load';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import { PluginsBrowserListVariant } from './types';

import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;

const PluginsBrowserList = ( {
	plugins,
	variant = PluginsBrowserListVariant.Fixed,
	title,
	subtitle,
	extended,
	showPlaceholders,
	site,
	currentSites,
	listName,
	expandedListLink,
	size,
	search,
} ) => {
	const { __ } = useI18n();

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
					variant={
						extended ? PluginsBrowserElementVariant.Extended : PluginsBrowserElementVariant.Compact
					}
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
			<PluginBrowserItem isPlaceholder key={ 'placeholder-plugin-' + i } />
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
			{ ( title || subtitle ) && (
				<div className="plugins-browser-list__header">
					<div className="plugins-browser-list__titles">
						<div className={ classnames( 'plugins-browser-list__title', listName ) }>{ title }</div>
						<div className="plugins-browser-list__subtitle">{ subtitle }</div>
					</div>
					<div className="plugins-browser-list__actions">
						{ expandedListLink && (
							<a className="plugins-browser-list__browse-all" href={ expandedListLink }>
								{ __( 'Browse All' ) }
								<Gridicon icon="arrow-right" size="18" />
							</a>
						) }
					</div>
				</div>
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
