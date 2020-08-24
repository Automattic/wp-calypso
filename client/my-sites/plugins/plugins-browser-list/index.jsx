/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import PluginBrowserItem from 'my-sites/plugins/plugins-browser-item';
import { Card } from '@automattic/components';
import Gridicon from 'components/gridicon';
import SectionHeader from 'components/section-header';

/**
 * Style dependencies
 */
import './style.scss';

const DEFAULT_PLACEHOLDER_NUMBER = 6;

class PluginsBrowserList extends Component {
	static displayName = 'PluginsBrowserList';

	static propTypes = {
		plugins: PropTypes.array.isRequired,
	};

	renderPluginsViewList() {
		let emptyCounter = 0;

		let pluginsViewsList = this.props.plugins.map( ( plugin, n ) => {
			return (
				<PluginBrowserItem
					site={ this.props.site }
					key={ plugin.slug + n }
					plugin={ plugin }
					currentSites={ this.props.currentSites }
					listName={ this.props.listName }
				/>
			);
		} );

		if ( this.props.showPlaceholders ) {
			pluginsViewsList = pluginsViewsList.concat( this.renderPlaceholdersViews() );
		}

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
		if ( this.props.plugins.length ) {
			return this.renderPluginsViewList();
		} else if ( this.props.showPlaceholders ) {
			return this.renderPlaceholdersViews();
		}
	}

	renderLink() {
		if ( this.props.expandedListLink ) {
			return (
				<a
					className="button is-link plugins-browser-list__select-all"
					href={ this.props.expandedListLink + ( this.props.site || '' ) }
				>
					{ this.props.translate( 'See All' ) }
					<Gridicon icon="chevron-right" size={ 18 } />
				</a>
			);
		}
	}

	render() {
		return (
			<div className="plugins-browser-list">
				<SectionHeader label={ this.props.title }>{ this.renderLink() }</SectionHeader>
				<Card className="plugins-browser-list__elements">{ this.renderViews() }</Card>
			</div>
		);
	}
}

export default localize( PluginsBrowserList );
