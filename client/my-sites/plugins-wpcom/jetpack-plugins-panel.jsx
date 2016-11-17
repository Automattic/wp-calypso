/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import {
	identity,
	find,
	matchesProperty,
	some
} from 'lodash';

/**
 * Internal dependencies
 */
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

	state = {
		selectedGroup: 'all',
		searchTerm: '',
	};

	onNavClick = selectedGroup => this.setState( { selectedGroup } );

	onNavSearch = searchTerm => this.setState( { searchTerm } );

	getSearchPlaceholder() {
		const { translate } = this.props;
		switch ( this.state.selectedGroup ) {
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

	getSelectedText() {
		const found = find( this.getNavItems(), matchesProperty( 'key', this.state.selectedGroup ) );
		return found ? found.title : '';
	}

	getNavItems() {
		const { translate } = this.props;

		return [
			{
				key: 'all',
				title: translate( 'All', { context: 'Filter label for plugins list' } ),
				onClick: () => this.onNavClick( 'all' ),
			},
			{
				key: 'engagement',
				title: translate( 'Engagement', { context: 'Filter label for plugins list' } ),
				onClick: () => this.onNavClick( 'engagement' ),
			},
			{
				key: 'security',
				title: translate( 'Security', { context: 'Filter label for plugins list' } ),
				onClick: () => this.onNavClick( 'security' ),
			},
			{
				key: 'appearance',
				title: translate( 'Appearance', { context: 'Filter label for plugins list' } ),
				onClick: () => this.onNavClick( 'appearance' ),
			},
			{
				key: 'writing',
				title: translate( 'Writing', { context: 'Filter label for plugins list' } ),
				onClick: () => this.onNavClick( 'writing' ),
			},
		];
	}

	getJetpackPlugins() {
		const groupedPlugins = jetpackPlugins.map( this.filterGroup ).filter( identity );
		if ( groupedPlugins.length ) {
			return groupedPlugins;
		}

		return <div>
			{ this.props.translate( 'No features match your search for %s.', {
				args: [ this.state.searchTerm ]
			} )}
		</div>;
	}

	filterGroup = group => {
		if ( 'all' === this.state.selectedGroup || group.category === this.state.selectedGroup ) {
			const plugins = group.plugins.map( this.filterPlugin ).filter( p => p );

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

	filterPlugin = ( plugin, pluginKey ) => {
		if (
			! this.state.searchTerm ||
			-1 !== plugin.name.toLowerCase().indexOf( this.state.searchTerm.toLowerCase() )
		) {
			const isActive = some(
				'standard' === plugin.plan,
				'premium' === plugin.plan && this.props.hasPremium,
				'business' === plugin.plan && this.props.hasBusiness
			);

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
		const { translate } = this.props;
		return (
			<div className="plugins-wpcom__jetpack-plugins-panel">

				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs selectedText={ this.getSelectedText() }>
						{ this.getNavItems().map( item =>
							<NavItem { ...item } selected={ item.key === this.state.selectedGroup }>
								{ item.title }
							</NavItem>
						) }
					</NavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.onNavSearch }
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
					{ this.getJetpackPlugins() }
				</CompactCard>

			</div>
		);
	}
}

export default localize( JetpackPluginsPanel );
