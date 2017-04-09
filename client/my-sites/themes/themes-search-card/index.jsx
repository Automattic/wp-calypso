/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import ThemesSelectDropdown from './select-dropdown';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { trackClick } from '../helpers';
import config from 'config';
import { isMobile } from 'lib/viewport';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { oldShowcaseUrl } from 'state/themes/utils';
import { getSelectedSiteId } from 'state/ui/selectors';

const ThemesSearchCard = React.createClass( {
	propTypes: {
		tier: React.PropTypes.string,
		select: React.PropTypes.func.isRequired,
		siteId: React.PropTypes.number,
		onSearch: React.PropTypes.func.isRequired,
		search: React.PropTypes.string,
		externalUrl: React.PropTypes.string,
		isJetpack: React.PropTypes.bool
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
		const { isJetpack } = this.props;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );
		const selectedTiers = isPremiumThemesEnabled ? tiers : [ find( tiers, tier => tier.value === 'free' ) ];

		return (
			<div className="themes__search-card" data-tip-target="themes-search-card">
				<SectionNav selectedText={ this.getSelectedTierFormatted( tiers ) }>
					{ ! isJetpack &&
					<NavTabs>
						{ this.getTierNavItems( selectedTiers ) }

						{ isPremiumThemesEnabled && <hr className="section-nav__hr" /> }

						{ isPremiumThemesEnabled && <NavItem
							path={ this.props.externalUrl }
							onClick={ this.onMore }
							isExternalLink={ true }>
							{ this.props.translate( 'More' ) + ' ' }
						</NavItem> }
					</NavTabs>
					}

					<Search
						pinned
						fitsContainer
						isOpen={ isJetpack }
						hideClose={ isJetpack }
						onSearch={ this.props.onSearch }
						initialValue={ this.props.search }
						ref="url-search"
						placeholder={ this.props.translate( 'Search themes…' ) }
						analyticsGroup="Themes"
						delaySearch={ true }
					/>
				</SectionNav>
			</div>
		);
	},

	render() {
		const { isJetpack } = this.props;
		const isPremiumThemesEnabled = config.isEnabled( 'upgrades/premium-themes' );

		const tiers = [
			{ value: 'all', label: this.props.translate( 'All' ) },
			{ value: 'free', label: this.props.translate( 'Free' ) },
			{ value: 'premium', label: this.props.translate( 'Premium' ) },
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
					placeholder={ this.props.translate( 'What kind of theme are you looking for?' ) }
					analyticsGroup="Themes"
					delaySearch={ true }
				/>

				{ isPremiumThemesEnabled && ! isJetpack &&
					<ThemesSelectDropdown
						tier={ this.props.tier }
						options={ tiers }
						onSelect={ this.props.select } /> }
				{ config.isEnabled( 'manage/themes/upload' ) && ! isJetpack &&
					<a className="button more"
						href={ this.props.externalUrl }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.onMore }>

						{ this.props.translate( 'More' ) }
					</a> }
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId ) || '';

		return {
			externalUrl: oldShowcaseUrl + siteSlug,
			isJetpack: isJetpackSite( state, siteId )
		};
	}
)( localize( ThemesSearchCard ) );
