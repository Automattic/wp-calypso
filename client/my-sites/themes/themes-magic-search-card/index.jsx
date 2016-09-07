/**
 * External dependencies
 */
import React from 'react';
import debounce from 'lodash/debounce';

/**
 * Internal dependencies
 */
import Search from 'components/search';
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

	getInitialState() {
		return {
			isMobile: isMobile(),
			searchIsOpen: false,
			textInInput: "",
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
	},

	onBlur() {
		if ( this.state.isMobile ) {
			this.setState( { searchIsOpen: false } );
		}
	},

	onSearch( input ) {
		this.setState( { textInInput: this.state.textInInput + input })
		this.props.onSearch( this.state.textInInput );
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
				onSearch={ this.onSearch }
				initialValue={ "" }
				ref="url-search"
				placeholder={ this.translate( 'What kind of theme are you looking for?' ) }
				analyticsGroup="Themes"
				delaySearch={ false }
				onSearchOpen={ this.onSearchOpen }
				onSearchClose={ this.onSearchClose }
				onBlur={ this.onBlur }
				fitsContainer={ this.state.isMobile && this.state.searchIsOpen }
				hideClose={ isMobile() }
			>
				{
					<div>
						{ this.state.textInInput }
					</div>
				}
			</Search>
		);

		return (
			<div className="themes-magic-search-card" data-tip-target="themes-search-card">
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
