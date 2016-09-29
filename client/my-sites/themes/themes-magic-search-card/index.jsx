/**
 * External dependencies
 */
import React from 'react';
import debounce from 'lodash/debounce';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import SegmentedControl from 'components/segmented-control';
import Suggestions from 'components/suggestions';
import { trackClick } from '../helpers';
import config from 'config';
import { isMobile } from 'lib/viewport';
import { filterIsValid } from '../theme-filters.js';

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
			searchIsOpen: false
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
		this.setState( { searchIsOpen: false } );
	},

	searchTokens( input ) {
		const tokens = input.split( /(\s+)/ );

		return (
			tokens.map( ( token, i ) => {
				if ( token.trim() === '' ) {
					return <span className="themes-magic-search-card__search-white-space" key={ i }>{ token }</span>; // use shortid for key
				} else if ( filterIsValid( token ) ) {
					const separator = ':';
					const [ taxonomy, filter ] = token.split( separator );
					return (
						<span className="themes-magic-search-card__token" key={ i }>
							<span className="themes-magic-search-card__token-taxonomy">{ taxonomy }</span>
							<span className="themes-magic-search-card__token-separator">{ separator }</span>
							<span className="themes-magic-search-card__token-filter">{ filter }</span>
						</span>
					);
				}
				return <span className="themes-magic-search-card__search-text" key={ i }>{ token }</span>; // use shortid for key
			} )
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

		const searchField = (
			<Search
				onSearch={ this.props.onSearch }
				initialValue={ this.props.search }
				ref="url-search"
				placeholder={ this.translate( 'What kind of theme are you looking for?' ) }
				analyticsGroup="Themes"
				delaySearch={ true }
				onSearchOpen={ this.onSearchOpen }
				onSearchClose={ this.onSearchClose }
				overlayStyling={ this.searchTokens }
				onBlur={ this.onBlur }
				fitsContainer={ this.state.isMobile && this.state.searchIsOpen }
				hideClose={ isMobile() }
			/>
		);

		const magicSearchClass = classNames( 'themes-magic-search', {
			'has-suggestions': this.state.searchIsOpen
		} );

		const themesSearchCardClass = classNames( 'themes-magic-search-card', {
			'has-highlight': this.state.searchIsOpen
		} );

		return (
			<div className={ magicSearchClass }>
				<div className={ themesSearchCardClass } data-tip-target="themes-search-card">
					{ searchField }
					{ isPremiumThemesEnabled && ! isJetpack &&
						<SegmentedControl
							initialSelected={ this.props.tier }
							options={ tiers }
							onSelect={ this.props.select }
						/>
					}
				</div>
				<Suggestions/>
			</div>
		);
	}
} );

export default ThemesMagicSearchCard;
