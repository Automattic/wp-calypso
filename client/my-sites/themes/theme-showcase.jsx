/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { compact, pickBy } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { addTracking, trackClick } from './helpers';
import ThemePreview from './theme-preview';
import ThemesSearchCard from './themes-magic-search-card';
import ThemesSelection from './themes-selection';
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import QueryThemeFilters from 'components/data/query-theme-filters';
import Main from 'components/main';
import SubMasterbarNav from 'components/sub-masterbar-nav';
import config from 'config';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import buildUrl from 'lib/build-url';
import { recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getThemeFilterTerms, getThemeFilterToTermTable, getThemeShowcaseDescription, getThemeShowcaseTitle, prependThemeFilterKeys } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const subjectsMeta = {
	photo: { icon: 'camera', order: 1 },
	portfolio: { icon: 'custom-post-type', order: 2 },
	magazine: { icon: 'reader', order: 3 },
	blog: { icon: 'posts', order: 4 },
	business: { icon: 'cart', order: 5 },
	wedding: { icon: 'heart', order: 6 },
	minimal: { icon: 'minus-small', order: 7 },
	travel: { icon: 'globe', order: 8 },
	food: { icon: 'flip-horizontal', order: 9 },
	music: { icon: 'audio', order: 10 }
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
		pathName: PropTypes.string,
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		secondaryOption: optionShape,
		getScreenshotOption: PropTypes.func,
		siteSlug: PropTypes.string,
		trackATUploadClick: PropTypes.func,
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

	doSearch( searchBoxContent ) {
		const filterRegex = /(\w+)\:([\w-]*)/g;
		const { filterToTermTable } = this.props;

		const filters = searchBoxContent.match( filterRegex ) || [];
		const validFilters = filters.map( ( filter ) => filterToTermTable[ filter ] );

		const url = this.constructUrl( {
			filter: compact( validFilters ).join( '+' ),
			// Strip filters and excess whitespace
			searchString: searchBoxContent.replace( filterRegex, '' ).replace( /\s+/g, ' ' ).trim(),
		} );
		page( url );
	},

	/**
	 * Returns a full showcase url from current props.
	 *
	 * @param {Object} sections fields from this object will override current props.
	 * @param {String} sections.vertical override vertical prop
	 * @param {String} sections.tier override tier prop
	 * @param {String} sections.filter override filter prop
	 * @param {String} sections.siteSlug override siteSlug prop
	 * @param {String} sections.searchString override searchString prop
	 *
	 * @returns {String} Theme showcase url
	 */
	constructUrl( sections ) {
		const {
			vertical,
			tier,
			filter,
			siteSlug,
			searchString
		} = { ...this.props, ...sections };

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = ( tier && tier !== 'all' ) ? `/${ tier }` : '';

		let filterSection = filter ? `/filter/${ filter }` : '';
		filterSection = filterSection.replace( /\s/g, '+' );

		const url = `/themes${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
		return buildUrl( url, searchString );
	},

	onTierSelect( { value: tier } ) {
		trackClick( 'search bar filter', tier );
		const url = this.constructUrl( { tier } );
		page( url );
	},

	onUploadClick() {
		trackClick( 'upload theme' );
		if ( this.props.atEnabled ) {
			this.props.trackATUploadClick();
		}
	},

	showUploadButton() {
		const { isMultisite, isLoggedIn } = this.props;

		return (
			config.isEnabled( 'manage/themes/upload' ) &&
			isLoggedIn &&
			! isMultisite
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
			siteSlug,
			isLoggedIn,
			pathName,
			title,
			filterString,
			isMultisite,
		} = this.props;
		const tier = config.isEnabled( 'upgrades/premium-themes' ) ? this.props.tier : 'free';

		const canonicalUrl = 'https://wordpress.com' + pathName;

		const metas = [
			{ name: 'description', property: 'og:description', content: this.props.description },
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' }
		];

		const links = [ { rel: 'canonical', href: canonicalUrl } ];

		const headerIcons = [ {
			label: 'new',
			uri: this.constructUrl( { vertical: '' } ),
			icon: 'star'
		} ].concat(
			Object.keys( this.props.subjects )
				.map( subject => subjectsMeta[ subject ] && {
					label: subject,
					uri: this.constructUrl( { vertical: subject } ),
					icon: subjectsMeta[ subject ].icon,
					order: subjectsMeta[ subject ].order
				} )
				.filter( icon => !! icon )
				.sort( ( a, b ) => a.order - b.order )
		);

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<Main className="themes">
				<DocumentHead title={ title } meta={ metas } link={ links } />
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle } />
				{ ! isLoggedIn && (
					<SubMasterbarNav
						options={ headerIcons }
						fallback={ headerIcons[ 0 ] }
						uri={ this.constructUrl() } />
				)}
				<div className="themes__content">
					<QueryThemeFilters />
					<ThemesSearchCard
						onSearch={ this.doSearch }
						search={ filterString + search }
						tier={ tier }
						showTierThemesControl={ ! isMultisite }
						select={ this.onTierSelect } />
					{ this.showUploadButton() && <Button className="themes__upload-button" compact icon
						onClick={ this.onUploadClick }
						href={ siteSlug ? `/themes/upload/${ siteSlug }` : '/themes/upload' }>
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
				</div>
			</Main>
		);
	}
} );

const mapStateToProps = ( state, { siteId, filter, tier, vertical } ) => ( {
	isLoggedIn: !! getCurrentUserId( state ),
	siteSlug: getSiteSlug( state, siteId ),
	description: getThemeShowcaseDescription( state, { filter, tier, vertical } ),
	title: getThemeShowcaseTitle( state, { filter, tier, vertical } ),
	subjects: getThemeFilterTerms( state, 'subject' ) || {},
	filterString: prependThemeFilterKeys( state, filter ),
	filterToTermTable: getThemeFilterToTermTable( state ),
} );

const mapDispatchToProps = {
	trackATUploadClick: () => recordTracksEvent( 'calypso_automated_transfer_click_theme_upload' )
};
export default connect( mapStateToProps, mapDispatchToProps )( localize( ThemeShowcase ) );
