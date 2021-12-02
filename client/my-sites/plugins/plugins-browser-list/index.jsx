import { Card } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import PluginBrowserItem from 'calypso/my-sites/plugins/plugins-browser-item';
import { PluginsBrowserElementVariant } from 'calypso/my-sites/plugins/plugins-browser-item/types';
import { PluginsBrowserListVariant } from './types';
import { trim } from 'lodash';
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
				<div className="plugins-browser-list__header">
					<div
						className={ classnames(
							'plugins-browser-list__title',
							this.props.listName.replace( /\s/g, '' )
						) }
					>
						{ this.props.title }
					</div>
					<div className="plugins-browser-list__subtitle">{ this.props.subtitle }</div>
				</div>
				<Card className="plugins-browser-list__elements">{ this.renderViews() }</Card>
			</div>
		);
	}
}

export default localize( PluginsBrowserList );
