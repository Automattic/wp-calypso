/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { pickBy } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Button from 'components/button';
import ThemesSelection from './themes-selection';
import StickyPanel from 'components/sticky-panel';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { addTracking, trackClick } from './helpers';
import DocumentHead from 'components/data/document-head';
import { getFilter, getSortedFilterTerms, stripFilters } from './theme-filters.js';
import buildUrl from 'lib/mixins/url-search/build-url';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import ThemePreview from './theme-preview';
import config from 'config';

const ThemesSearchCard = config.isEnabled( 'manage/themes/magic-search' )
	? require( './themes-magic-search-card' )
	: require( './themes-search-card' );

const themesMeta = {
	'': {
		title: 'WordPress Themes',
		description: 'Beautiful, responsive, free and premium WordPress themes ' +
			'for your photography site, portfolio, magazine, business website, or blog.',
		canonicalUrl: 'https://wordpress.com/design',
	},
	free: {
		title: 'Free WordPress Themes',
		description: 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/design/free',
	},
	premium: {
		title: 'Premium WordPress Themes',
		description: 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/design/premium',
	}
};

const optionShape = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func
} );

const ThemeShowcase = React.createClass( {
	propTypes: {
		emptyContent: PropTypes.element,
		tier: PropTypes.oneOf( [ '', 'free', 'premium' ] ),
		search: PropTypes.string,
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		secondaryOption: optionShape,
		getScreenshotOption: PropTypes.func,
		siteSlug: PropTypes.string,
	},

	getDefaultProps() {
		return {
			tier: '',
			search: '',
			emptyContent: null,
			showUploadButton: true
		};
	},

	getInitialState() {
		return {
			page: 1,
			showPreview: false,
		};
	},

	prependFilterKeys() {
		const { filter } = this.props;
		if ( filter ) {
			return filter.split( ',' ).map( getFilter ).join( ' ' ) + ' ';
		}
		return '';
	},

	doSearch( searchBoxContent ) {
		const filter = getSortedFilterTerms( searchBoxContent );
		const searchString = stripFilters( searchBoxContent );
		this.updateUrl( this.props.tier || 'all', filter, searchString );
	},

	updateUrl( tier, filter, searchString = this.props.search ) {
		const { siteSlug, vertical } = this.props;

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier === 'all' ? '' : `/${ tier }`;
		const filterSection = filter ? `/filter/${ filter }` : '';

		const url = `/design${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
		page( buildUrl( url, searchString ) );
	},

	onTierSelect( { value: tier } ) {
		trackClick( 'search bar filter', tier );
		this.updateUrl( tier, this.props.filter );
	},

	onUploadClick() {
		trackClick( 'upload theme' );
	},

	showUploadButton() {
		const { isMultisite, isJetpack, isLoggedIn } = this.props;

		return (
			config.isEnabled( 'manage/themes/upload' ) &&
			isLoggedIn &&
			! isMultisite &&
			( isJetpack || config.isEnabled( 'automated-transfer' ) )
		);
	},

	render() {
		const {
			siteId,
			options,
			getScreenshotOption,
			search,
			filter,
			translate,
			siteSlug
		} = this.props;
		const tier = config.isEnabled( 'upgrades/premium-themes' ) ? this.props.tier : 'free';

		const metas = [
			{ name: 'description', property: 'og:description', content: themesMeta[ tier ].description },
			{ property: 'og:url', content: themesMeta[ tier ].canonicalUrl },
			{ property: 'og:type', content: 'website' }
		];

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<Main className="themes">
				<DocumentHead title={ themesMeta[ tier ].title } meta={ metas } />
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle } />
				<StickyPanel>
					<ThemesSearchCard
						onSearch={ this.doSearch }
						search={ this.prependFilterKeys() + search }
						tier={ tier }
						select={ this.onTierSelect } />
				</StickyPanel>
				{ this.showUploadButton() && <Button className="themes__upload-button" compact icon
					onClick={ this.onUploadClick }
					href={ siteSlug ? `/design/upload/${ siteSlug }` : '/design/upload' }>
					<Gridicon icon="cloud-upload" />
					{ translate( 'Upload Theme' ) }
				</Button>
				}
				<ThemesSelection
					search={ search }
					tier={ this.props.tier }
					filter={ filter }
					vertical={ this.props.vertical }
					siteId={ this.props.siteId }
					listLabel={ this.props.listLabel }
					defaultOption={ this.props.defaultOption }
					secondaryOption={ this.props.secondaryOption }
					placeholderCount={ this.props.placeholderCount }
					getScreenshotUrl={ function( theme ) {
						if ( ! getScreenshotOption( theme ).getUrl ) {
							return null;
						}
						return getScreenshotOption( theme ).getUrl( theme );
					} }
					onScreenshotClick={ function( theme ) {
						if ( ! getScreenshotOption( theme ).action ) {
							return;
						}
						getScreenshotOption( theme ).action( theme );
					} }
					getActionLabel={ function( theme ) {
						return getScreenshotOption( theme ).label;
					} }
					getOptions={ function( theme ) {
						return pickBy(
							addTracking( options ),
							option => ! ( option.hideForTheme && option.hideForTheme( theme, siteId ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
					emptyContent={ this.props.emptyContent }
				/>
				<ThemePreview />
				{ this.props.children }
			</Main>
		);
	}
} );

export default connect(
	( state, { siteId } ) => ( {
		isLoggedIn: !! getCurrentUserId( state ),
		siteSlug: getSiteSlug( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
	} )
)( localize( ThemeShowcase ) );
