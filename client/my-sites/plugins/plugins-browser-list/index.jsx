import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SectionHeader from 'calypso/components/section-header';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import { PluginsBrowserListVariant } from './types';
import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;

class PluginsBrowserList extends Component {
	static displayName = 'PluginsBrowserList';

	static propTypes = {
		plugins: PropTypes.array.isRequired,
		variant: PropTypes.oneOf( Object.values( PluginsBrowserListVariant ) ).isRequired,
		extended: PropTypes.bool,
	};

	static defaultProps = {
		variant: PluginsBrowserListVariant.Fixed,
	};

	renderPluginsViewList() {
		let emptyCounter = 0;

		const pluginsViewsList = this.props.plugins.map( ( plugin, n ) => {
			return (
				<PluginBrowserItem
					site={ this.props.site }
					key={ plugin.slug + n }
					plugin={ plugin }
					currentSites={ this.props.currentSites }
					listName={ this.props.listName }
					variant={
						this.props.extended
							? PluginsBrowserElementVariant.Extended
							: PluginsBrowserElementVariant.Compact
					}
				/>
			);
		} );

		// We need to complete the list with empty elements to keep the grid drawn.
		while ( pluginsViewsList.length % 3 !== 0 || pluginsViewsList.length % 2 !== 0 ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			pluginsViewsList.push(
				<div className="plugins-browser-item is-empty" key={ 'empty-item-' + emptyCounter++ } />
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		if ( this.props.size ) {
			return pluginsViewsList.slice( 0, this.props.size );
		}

		return pluginsViewsList;
	}

	renderPlaceholdersViews() {
		return times( this.props.size || DEFAULT_PLACEHOLDER_NUMBER, ( i ) => (
			<PluginBrowserItem isPlaceholder key={ 'placeholder-plugin-' + i } />
		) );
	}

	renderViews() {
		const { plugins, showPlaceholders, variant } = this.props;

		if ( ! plugins.length ) {
			return this.renderPlaceholdersViews();
		}

		switch ( variant ) {
			case PluginsBrowserListVariant.InfiniteScroll:
				if ( showPlaceholders ) {
					return this.renderPluginsViewList().concat( this.renderPlaceholdersViews() );
				}
				return this.renderPluginsViewList();
			case PluginsBrowserListVariant.Paginated:
				if ( showPlaceholders ) {
					return this.renderPlaceholdersViews();
				}
				return this.renderPluginsViewList();
			case PluginsBrowserListVariant.Fixed:
			default:
				return this.renderPluginsViewList();
		}
	}

	render() {
		return (
			<div className="plugins-browser-list">
				<SectionHeader label={ this.props.title } />
				<Card className="plugins-browser-list__elements">{ this.renderViews() }</Card>
			</div>
		);
	}
}

export default localize( PluginsBrowserList );
