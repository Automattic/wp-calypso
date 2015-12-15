/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	find = require( 'lodash/collection/find' ),
	debounce = require( 'lodash/function/debounce' );

/**
 * Internal dependencies
 */
var Search = require( 'components/search' ),
	ThemesSelectDropdown = require( './select-dropdown' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	Helper = require( 'lib/themes/helpers' ),
	config = require( 'config' ),
	isMobile = require( 'lib/viewport' ).isMobile;

var ThemesSearchCard = React.createClass( {
	propTypes: {
		tier: React.PropTypes.string.isRequired,
		select: React.PropTypes.func.isRequired,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		onSearch: React.PropTypes.func.isRequired,
		search: React.PropTypes.string
	},

	trackClick: Helper.trackClick.bind( null, 'search bar' ),

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
		const isPremiumThemesEnabled = config.isEnabled( 'premium-themes' );
		const selectedTiers = isPremiumThemesEnabled ? tiers : [ tiers.find( tier => tier.value === 'free' ) ];

		return (
			<div className="themes__search-card">
				<SectionNav selectedText={ this.getSelectedTierFormatted( tiers ) }>
					<NavTabs>
						{ ! isJetpack && this.getTierNavItems( selectedTiers ) }

						{ isPremiumThemesEnabled && <hr className="section-nav__hr" /> }

						{ isPremiumThemesEnabled && <NavItem
														path={ Helper.getExternalThemesUrl( this.props.site ) }
														onClick={ this.onMore }
														isExternalLink={ true }>
														{ this.translate( 'More' ) + ' ' }
													</NavItem> }
					</NavTabs>

					<Search
						pinned={ true }
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
		const isPremiumThemesEnabled = config.isEnabled( 'premium-themes' );

		const tiers = [
			{ value: 'all', label: this.translate( 'All' ) },
			{ value: 'free', label: this.translate( 'Free' ) },
			{ value: 'premium', label: this.translate( 'Premium' ) },
		];

		if ( this.state.isMobile ) {
			return this.renderMobile( tiers );
		}

		return (
			<div className="themes__search-card">
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
												href={ Helper.getExternalThemesUrl( this.props.site ) }
												target="_blank"
												onClick={ this.onMore }>

												{ this.translate( 'More' ) }
											</a> }
			</div>
		);
	}
} );

module.exports = ThemesSearchCard;
