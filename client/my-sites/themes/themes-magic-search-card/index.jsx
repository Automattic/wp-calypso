/**
 * External dependencies
 */
import React from 'react';
import debounce from 'lodash/debounce';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Search from 'components/search-tokens';
import SegmentedControl from 'components/segmented-control';
import { trackClick } from '../helpers';
import config from 'config';
import { isMobile } from 'lib/viewport';

const ThemesMagicSearchCard = React.createClass( {
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

	componentDidUpdate() {
		this.matchScroll( );
	},

	getInitialState() {
		return {
			isMobile: isMobile(),
			searchIsOpen: false,
			input: this.props.search,
		};
	},

	getDefaultProps() {
		return { tier: 'all' };
	},

	onSearchOpen() {
		this.setState( { searchIsOpen: true } );
	},

	onSearchClose() {
		this.setState( { searchIsOpen: false } );
		this.setState( { input: "" } );
	},

	onBlur() {
		this.setState( { searchIsOpen: false } );
	},

	matchScroll: function( ) {
		if ( this.refs.tokens === undefined ) {
			return;
		}

		const searchInput = this.refs["url-search"].refs.searchInput;
		const tokens = this.refs.tokens;

		// tokens.scrollLeft = values[0].target.scrollLeft;
		tokens.scrollLeft = searchInput.scrollLeft;
		searchInput.scrollLeft = tokens.scrollLeft;
		console.log( "input: " + searchInput.scrollLeft + " tokens: " + tokens.scrollLeft);
	},

	onChange( value ) {
		this.setState( { input: value } );
	},

	render() {
		const isJetpack = this.props.site && this.props.site.jetpack;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );

		const tiers = [
			{ value: 'all', label: this.translate( 'All' ) },
			{ value: 'free', label: this.translate( 'Free' ) },
			{ value: 'premium', label: this.translate( 'Premium' ) },
		];

		const searchField = (
			<Search
				onSearch={ this.props.onSearch }
				initialValue={ this.props.search }
				ref="url-search"
				placeholder={ this.translate( 'What kind of theme are you looking for?' ) }
				analyticsGroup="Themes"
				delaySearch={ false }
				onSearchOpen={ this.onSearchOpen }
				onSearchClose={ this.onSearchClose }
				onBlur={ this.onBlur }
				onKeyDown={ this.onKeyDown }
				onChange={ this.onChange }
				fitsContainer={ this.state.isMobile && this.state.searchIsOpen }
				hideClose={ isMobile() }
				>
			</Search>
		);

		const themesSearchClass = classNames( 'themes-magic-search-card', {
			'has-highlight': this.state.searchIsOpen
		} );

		return (
			<div className={ themesSearchClass } data-tip-target="themes-search-card">
				{ searchField }
				{ isPremiumThemesEnabled && ! isJetpack &&
					<SegmentedControl
						initialSelected={ this.props.tier }
						options={ tiers }
						onSelect={ this.props.select }
					/>
				}
			</div>
		);
	}
} );

export default ThemesMagicSearchCard;
