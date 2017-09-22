/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { find, identity, includes, matchesProperty, overSome, some } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import JetpackPluginItem from './jetpack-plugin-item';
import jetpackPlugins from './jetpack-plugins';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import CompactCard from 'components/card/compact';
import Search from 'components/search';
import SectionHeader from 'components/section-header';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Tooltip from 'components/tooltip';
import { isEnabled } from 'config';
import urlSearch from 'lib/url-search';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';

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

const isPluginActive = ( plugin, hasPremium, hasBusiness ) => some( [
	'standard' === plugin.plan,
	'premium' === plugin.plan && hasPremium,
	'business' === plugin.plan && hasBusiness,
] );

class JetpackPluginsPanel extends Component {

	state = {
		addPluginTooltip: false
	};

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
				title: translate( 'All' ),
				path: '/plugins/manage' + siteFilter,
			},
			{
				key: 'engagement',
				title: translate( 'Engagement' ),
				path: basePath + '/engagement' + siteFilter,
			},
			{
				key: 'security',
				title: translate( 'Security' ),
				path: basePath + '/security' + siteFilter,
			},
			{
				key: 'appearance',
				title: translate( 'Appearance' ),
				path: basePath + '/appearance' + siteFilter,
			},
			{
				key: 'writing',
				title: translate( 'Writing' ),
				path: basePath + '/writing' + siteFilter,
			},
		];
	}

	showPluginTooltip = () => this.setState( { addPluginTooltip: true } );

	hidePluginTooltip = () => this.setState( { addPluginTooltip: false } );

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

		const browserUrl = [ '/plugins/browse', this.props.siteSlug ].join( '/' );
		const uploadUrl = '/plugins/upload' + ( this.props.siteSlug ? '/' + this.props.siteSlug : '' );

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

				<SectionHeader label={ translate( 'Plugins' ) }>
					<ButtonGroup key="plugin-list-header__buttons-browser">
						<Button
							compact
							href={ browserUrl }
							onMouseEnter={ this.showPluginTooltip }
							onMouseLeave={ this.hidePluginTooltip }
							ref="addPluginButton"
							aria-label={ translate( 'Browse all plugins', { context: 'button label' } ) }>
							<Gridicon key="plus-icon" icon="plus-small" size={ 18 } />
							<Gridicon key="plugins-icon" icon="plugins" size={ 18 } />
							<Tooltip
								isVisible={ this.state.addPluginTooltip }
								context={ this.refs && this.refs.addPluginButton }
								position="bottom">
								{ translate( 'Browse all plugins' ) }
							</Tooltip>
						</Button>
					</ButtonGroup>

					{
						isEnabled( 'manage/plugins/upload' ) && (
							<ButtonGroup key="plugin-list-header__buttons-upload">
								<Button
									compact
									href={ uploadUrl }
									aria-label={ translate( 'Upload Plugin' ) }
								>
									<Gridicon icon="cloud-upload" size={ 18 } />
									{ translate( 'Upload Plugin' ) }
								</Button>
							</ButtonGroup>
						)
					}
				</SectionHeader>

				<CompactCard className="plugins-wpcom__jetpack-main-plugin plugins-wpcom__jetpack-plugin-item">
					<div className="plugins-wpcom__plugin-link">
						<PluginIcon image="//ps.w.org/jetpack/assets/icon-256x256.png" />
						<div className="plugins-wpcom__plugin-content">
							<div className="plugins-wpcom__plugin-name">
								{ translate( 'Jetpack by WordPress.com' ) }
							</div>
							<div className="plugins-wpcom__plugin-description">
								{ translate( 'Jetpack simplifies managing WordPress sites by giving you visitor stats, security services, SEO tools, and more.' ) }
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
