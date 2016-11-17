/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import {
	map,
	identity,
	find
} from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import urlSearch from 'lib/mixins/url-search/component';
import CompactCard from 'components/card/compact';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import JetpackPluginItem from './jetpack-plugin-item';
import SectionHeader from 'components/section-header';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import jetpackPlugins from './jetpack-plugins';

class JetpackPluginsPanel extends Component {

	static propTypes = {
		siteSlug: PropTypes.string,
		hasBusiness: PropTypes.bool,
		hasPremium: PropTypes.bool,
	};

	static defaultProps = {
		translate: identity,
	};

	// constructor( props ) {
	// 	super( props );
	//
	// 	this.state = {
	// 		selectedGroup: 'all',
	// 	};
	// }

	// onNavClick( group ) {
	// 	this.setState( {
	// 		selectedGroup: group,
	// 	} );
	// }

	getSearchPlaceholder() {
		const { translate, category } = this.props;
		switch ( category ) {
			case 'all':
				return translate( 'Search All…', { textOnly: true } );
			case 'engagement':
				return translate( 'Search Engagement…', { textOnly: true } );
			case 'security':
				return translate( 'Search Security…', { textOnly: true } );
			case 'appearance':
				return translate( 'Search Appearance…', { textOnly: true } );
			case 'writing':
				return translate( 'Search Writing…', { textOnly: true } );
		}
	}

	getSelectedText( category ) {
		const found = find( this.getNavItems(), item => category === item.key );
		return found ? found.title : '';
	}

	getNavItems() {
		const { translate, siteSlug } = this.props;
		const siteFilter = siteSlug ? '/' + siteSlug : '';
		const basePath = '/plugins/category';

		return [
			{
				key: 'all',
				title: translate( 'All', { context: 'Filter label for plugins list' } ),
				path: '/plugins' + siteFilter,
			},
			{
				key: 'engagement',
				title: translate( 'Engagement', { context: 'Filter label for plugins list' } ),
				path: basePath + '/engagement' + siteFilter,
			},
			{
				key: 'security',
				title: translate( 'Security', { context: 'Filter label for plugins list' } ),
				path: basePath + '/security' + siteFilter,
			},
			{
				key: 'appearance',
				title: translate( 'Appearance', { context: 'Filter label for plugins list' } ),
				path: basePath + '/appearance' + siteFilter,
			},
			{
				key: 'writing',
				title: translate( 'Writing', { context: 'Filter label for plugins list' } ),
				path: basePath + '/writing' + siteFilter,
			},
		];
	}

	filterGroup( group ) {
		if ( 'all' === this.props.category || group.category === this.props.category ) {
			const plugins = group.plugins.map( ( plugin, j ) => this.filterPlugin( plugin, j ) ).filter( p => p );

			if ( plugins.length > 0 ) {
				return <div key={ group.category }>
					<CompactCard className="plugins-wpcom__jetpack-category-header">
						<Gridicon icon={ group.icon } />
						<span>
							{ group.name }
						</span>
					</CompactCard>
					{ plugins }
				</div>;
			}
		}
	}

	filterPlugin( plugin, pluginKey ) {
		if (
			! this.props.search ||
			-1 !== plugin.name.toLowerCase().indexOf( this.props.search.toLowerCase() )
		) {
			let isActive = false;
			if (
				'standard' === plugin.plan ||
				( 'premium' === plugin.plan && this.props.hasPremium ) ||
				( 'business' === plugin.plan && this.props.hasBusiness )
			) {
				isActive = true;
			}

			return <JetpackPluginItem
				{ ...{
					key: pluginKey,
					plugin,
					isActive,
					siteSlug: this.props.siteSlug,
				} }
			/>;
		}
	}

	render() {
		const { translate, doSearch, category } = this.props;
		return (
			<div className="plugins-wpcom__jetpack-plugins-panel">

				<SectionNav selectedText={ this.getSelectedText( category ) }>
					<NavTabs selectedText={ this.getSelectedText( category ) }>
						{ this.getNavItems().map( item =>
							<NavItem { ...item } selected={ item.key === category }>
								{ item.title }
							</NavItem>
						) }
					</NavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ doSearch }
						placeholder={ this.getSearchPlaceholder() }
					/>
				</SectionNav>

				<SectionHeader label={ translate( 'Plugins' ) } />

				<CompactCard className={ classNames( 'plugins-wpcom__jetpack-main-plugin', 'plugins-wpcom__jetpack-plugin-item' ) }>
					<div className="plugins-wpcom__plugin-link">
						<PluginIcon image="//ps.w.org/jetpack/assets/icon-256x256.png" />
						<div className="plugins-wpcom__plugin-content">
							<div className="plugins-wpcom__plugin-name">
								{ translate( 'Jetpack by WordPress.com' ) }
							</div>
							<div className="plugins-wpcom__plugin-description">
								{ translate( 'Jetpack essential features are included on every plan' ) }
							</div>
						</div>
					</div>
					<div className="plugins-wpcom__plugin-actions">
						<Button className="plugins-wpcom__plugin-is-active is-active-plugin" compact borderless>
							<Gridicon icon="checkmark" />{ translate( 'Active' ) }
						</Button>
					</div>
				</CompactCard>

				<CompactCard className="plugins-wpcom__jetpack-plugins-list">
					{ map( jetpackPlugins, group => this.filterGroup( group ) ) }
				</CompactCard>

			</div>
		);
	}
}

export default localize( urlSearch( JetpackPluginsPanel ) );
