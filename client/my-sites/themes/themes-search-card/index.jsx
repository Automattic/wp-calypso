/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import ThemesSelectDropdown from './select-dropdown';
import ThemesSelectButtons from './select-buttons';
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
		return {
			isMobile: isMobile(),
			searchIsOpen: false
		};
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

	onSearchOpen( ) {
		this.setState( { searchIsOpen : true } );
	},

	onSearchClose( event ) {
		this.setState( { searchIsOpen : false } );
	},

	onBlur() {
		if ( this.state.isMobile ) {//searchString === "" ) {
			this.setState( { searchIsOpen : false } );
		}
	},

	onSelect( selection ) {
		if( selection.value === 'more' ) {
			this.onMore();
		} else {
			this.props.select( selection );
		}
	},

	render() {
		const isJetpack = this.props.site && this.props.site.jetpack;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );

		const tiers = [
			{ value: 'all', label: this.translate( 'All' ) },
			{ value: 'free', label: this.translate( 'Free' ) },
			{ value: 'premium', label: this.translate( 'Premium' ) },
		];

		if( isPremiumThemesEnabled ) {
			tiers.push( { value: 'more', label: this.translate( 'More'), path: getExternalThemesUrl( this.props.site ) } );
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
					onSearchOpen={ this.onSearchOpen }
					onSearchClose={ this.onSearchClose }
					onBlur={ this.onBlur }
					fitsContainer={ this.state.isMobile && this.state.searchIsOpen }
					hideClose={ isMobile() }
				/>
				{ isPremiumThemesEnabled && ! isJetpack &&
					<ThemesSelectButtons
						tier={ this.props.tier }
						options={ tiers }
						onSelect={ this.onSelect }
					/> }
			</div>
		);
	}
} );

export default ThemesSearchCard;
