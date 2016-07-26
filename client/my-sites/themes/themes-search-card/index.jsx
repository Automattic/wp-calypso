/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';
import debounce from 'lodash/debounce';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import ThemesSelectDropdown from './select-dropdown';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { getExternalThemesUrl, trackClick } from '../helpers';
import config from 'config';
import { isMobile } from 'lib/viewport';

const ThemesSearchCard = React.createClass( {
	propTypes: {
		tier: React.PropTypes.string,
		select: React.PropTypes.func.isRequired,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		onSearch: React.PropTypes.func.isRequired,
		search: React.PropTypes.string
	},

	trackClick: trackClick.bind( null, 'search bar' ),

	componentWillMount() {
		this.onResize = debounce( () => {
			this.setState( { isMobile: isMobile() } );
		}, 250 );
	},

	componentDidMount() {
		window.addEventListener( 'resize', this.onResize );
	},

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
	},

	getInitialState() {
		return { isMobile: isMobile() };
	},

	getDefaultProps() {
		return { tier: 'all' };
	},

	getSelectedTierFormatted( tiers ) {
		const tier = find( tiers, { value: this.props.tier } );
		return tier ? <span>{ tier.label }</span> : null;
	},

	getTierNavItems( tiers ) {
		return tiers.map( ( { value, label } ) => (
			<NavItem key={ 'tier-' + value }
				selected={ value === this.props.tier }
				onClick={ this.props.select.bind( null, { value } ) }>
				{ label }
			</NavItem>
		) );
	},

	onMore() {
		this.trackClick( 'more' );
	},

	renderMobile( tiers ) {
		const isJetpack = this.props.site && this.props.site.jetpack;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );
		const selectedTiers = isPremiumThemesEnabled ? tiers : [ tiers.find( tier => tier.value === 'free' ) ];

		return (
			<div className="themes__search-card" data-tip-target="themes-search-card">
				<SectionNav selectedText={ this.getSelectedTierFormatted( tiers ) }>
					<NavTabs>
						{ ! isJetpack && this.getTierNavItems( selectedTiers ) }

						{ isPremiumThemesEnabled && <hr className="section-nav__hr" /> }

						{ isPremiumThemesEnabled && <NavItem
							path={ getExternalThemesUrl( this.props.site ) }
							onClick={ this.onMore }
							isExternalLink={ true }>
							{ this.translate( 'More' ) + ' ' }
						</NavItem> }
					</NavTabs>

					<Search
						pinned
						fitsContainer
						onSearch={ this.props.onSearch }
						initialValue={ this.props.search }
						ref="url-search"
						placeholder={ this.translate( 'Search themes…' ) }
						analyticsGroup="Themes"
						delaySearch={ true }
					/>
				</SectionNav>
			</div>
		);
	},

	render() {
		const isJetpack = this.props.site && this.props.site.jetpack;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );

		const tiers = [
			{ value: 'all', label: this.translate( 'All' ) },
			{ value: 'free', label: this.translate( 'Free' ) },
			{ value: 'premium', label: this.translate( 'Premium' ) },
		];

		if ( this.state.isMobile ) {
			return this.renderMobile( tiers );
		}

		return (
			<div className="themes__search-card" data-tip-target="themes-search-card">
				<Search
					onSearch={ this.props.onSearch }
					initialValue={ this.props.search }
					ref="url-search"
					placeholder={ this.translate( 'What kind of theme are you looking for?' ) }
					analyticsGroup="Themes"
					delaySearch={ true }
				/>

				{ isPremiumThemesEnabled && ! isJetpack && <ThemesSelectDropdown
										tier={ this.props.tier }
										options={ tiers }
										onSelect={ this.props.select } /> }
				{ isPremiumThemesEnabled && <a className="button more"
												href={ getExternalThemesUrl( this.props.site ) }
												target="_blank"
												onClick={ this.onMore }>

												{ this.translate( 'More' ) }
											</a> }
			</div>
		);
	}
} );

export default ThemesSearchCard;
