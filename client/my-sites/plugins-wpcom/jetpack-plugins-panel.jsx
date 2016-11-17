/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import {
	find,
	identity,
	includes,
	matchesProperty,
	overSome,
	some,
} from 'lodash';

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

const filterGroup = category => group => {
	if ( category && category !== 'all' ) {
		return group.category === category;
	}

	return true;
};

const searchPlugins = search => overSome(
	( { name } ) => includes( name.toLocaleLowerCase(), search.toLocaleLowerCase() ),
	( { description } ) => includes( description.toLocaleLowerCase(), search.toLocaleLowerCase() )
);

const isPluginActive = ( plugin, hasBusiness, hasPremium ) => some( [
	'standard' === plugin.plan,
	'premium' === plugin.plan && hasPremium,
	'business' === plugin.plan && hasBusiness,
] );

class JetpackPluginsPanel extends Component {

	static propTypes = {
		siteSlug: PropTypes.string,
		hasBusiness: PropTypes.bool,
		hasPremium: PropTypes.bool,
	};

	static defaultProps = {
		translate: identity,
		category: 'all',
		search: '',
	};

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
		const found = find( this.getNavItems(), matchesProperty( 'key', category ) );
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

	render() {
		const {
			translate,
			doSearch,
			category,
			siteSlug,
			search,
			hasPremium,
			hasBusiness
		} = this.props;

		const filteredPlugins = jetpackPlugins( translate )
			.filter( filterGroup( category ) )
			.map( group => ( {
				...group,
				plugins: group.plugins
					.filter( searchPlugins( search ) )
					.map( plugin => ( {
						...plugin,
						isActive: isPluginActive( plugin, hasPremium, hasBusiness ),
					} ) )
			} ) )
			.filter( group => group.plugins.length > 0 );

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
						delaySearch
						onSearch={ doSearch }
						placeholder={ this.getSearchPlaceholder() }
					/>
				</SectionNav>

				<SectionHeader label={ translate( 'Plugins' ) } />

				<CompactCard className="plugins-wpcom__jetpack-main-plugin plugins-wpcom__jetpack-plugin-item">
					<div className="plugins-wpcom__plugin-link">
						<PluginIcon image="//ps.w.org/jetpack/assets/icon-256x256.png" />
						<div className="plugins-wpcom__plugin-content">
							<div className="plugins-wpcom__plugin-name">
								{ translate( 'Jetpack by WordPress.com' ) }
							</div>
							<div className="plugins-wpcom__plugin-description">
								{ translate( 'Jetpack essential features are included with every plan' ) }
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
					{ filteredPlugins.length > 0 &&
						filteredPlugins.map( group => (
						<div key={ group.category }>
							<CompactCard className="plugins-wpcom__jetpack-category-header">
								<Gridicon icon={ group.icon } />
								<span>
									{ group.name }
								</span>
							</CompactCard>
							{ group.plugins.map( ( plugin, index ) => (
							<JetpackPluginItem
								{ ...{
									key: index,
									plugin,
									siteSlug,
								} }
							/>
							) ) }
						</div>
						) )
					}
					{ filteredPlugins.length === 0 &&
						<div className="plugins-wpcom__empty-results">
							{ translate( 'No features match your search for \'%s\'.', {
								args: [ search ]
							} )}
						</div>
					}
				</CompactCard>

			</div>
		);
	}
}

export default localize( urlSearch( JetpackPluginsPanel ) );
