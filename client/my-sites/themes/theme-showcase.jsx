/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { compact, omit, pickBy } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import Button from 'components/button';
import ThemesSelection from './themes-selection';
import SubMasterbarNav from 'components/sub-masterbar-nav';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { addTracking, trackClick } from './helpers';
import DocumentHead from 'components/data/document-head';
import buildUrl from 'lib/build-url';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import ThemePreview from './theme-preview';
import config from 'config';
import getThemeFilterTerms from 'state/selectors/get-theme-filter-terms';
import getThemeFilterToTermTable from 'state/selectors/get-theme-filter-to-term-table';
import getThemeShowcaseDescription from 'state/selectors/get-theme-showcase-description';
import getThemeShowcaseTitle from 'state/selectors/get-theme-showcase-title';
import prependThemeFilterKeys from 'state/selectors/prepend-theme-filter-keys';
import { recordTracksEvent } from 'state/analytics/actions';
import ThemesSearchCard from './themes-magic-search-card';
import QueryThemeFilters from 'components/data/query-theme-filters';
import PhotoBlogBanner from './themes-banner/photo-blog';
import SmallBusinessBanner from './themes-banner/small-business';
import RandomThemesBanner from './themes-banner/random-themes-banner';
import { getActiveTheme } from 'state/themes/selectors';
import UpworkBanner from 'blocks/upwork-banner';

/**
 * Style dependencies
 */
import './theme-showcase.scss';

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
	music: { icon: 'audio', order: 10 },
};

const optionShape = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func,
} );

class ThemeShowcase extends React.Component {
	static propTypes = {
		currentThemeId: PropTypes.string,
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
		upsellBanner: PropTypes.any,
		trackUploadClick: PropTypes.func,
		trackATUploadClick: PropTypes.func,
	};

	static defaultProps = {
		tier: '',
		search: '',
		emptyContent: null,
		upsellBanner: false,
		showUploadButton: true,
	};

	state = {
		page: 1,
		showPreview: false,
	};

	doSearch = searchBoxContent => {
		const filterRegex = /([\w-]*):([\w-]*)/g;
		const { filterToTermTable } = this.props;

		const filters = searchBoxContent.match( filterRegex ) || [];
		const validFilters = filters.map( filter => filterToTermTable[ filter ] );

		const url = this.constructUrl( {
			filter: compact( validFilters ).join( '+' ),
			// Strip filters and excess whitespace
			searchString: searchBoxContent
				.replace( filterRegex, '' )
				.replace( /\s+/g, ' ' )
				.trim(),
		} );
		page( url );
	};

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
	constructUrl = sections => {
		const { vertical, tier, filter, siteSlug, searchString } = { ...this.props, ...sections };

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier && tier !== 'all' ? `/${ tier }` : '';

		let filterSection = filter ? `/filter/${ filter }` : '';
		filterSection = filterSection.replace( /\s/g, '+' );

		const url = `/themes${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
		return buildUrl( url, searchString );
	};

	onTierSelect = ( { value: tier } ) => {
		trackClick( 'search bar filter', tier );
		const url = this.constructUrl( { tier } );
		page( url );
	};

	onUploadClick = () => {
		trackClick( 'upload theme' );
		this.props.trackUploadClick();
		if ( this.props.atEnabled ) {
			this.props.trackATUploadClick();
		}
	};

	showUploadButton = () => {
		const { isMultisite, isLoggedIn } = this.props;

		return isLoggedIn && ! isMultisite;
	};

	render() {
		const {
			currentThemeId,
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
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		const links = [ { rel: 'canonical', href: canonicalUrl } ];

		const headerIcons = [
			{
				label: 'new',
				uri: this.constructUrl( { vertical: '' } ),
				icon: 'star',
			},
		].concat(
			Object.keys( this.props.subjects )
				.map(
					subject =>
						subjectsMeta[ subject ] && {
							label: subject,
							uri: this.constructUrl( { vertical: subject } ),
							icon: subjectsMeta[ subject ].icon,
							order: subjectsMeta[ subject ].order,
						}
				)
				.filter( icon => !! icon )
				.sort( ( a, b ) => a.order - b.order )
		);

		const showBanners = currentThemeId || ! siteId || ! isLoggedIn;

		// We don't want to advertise the theme that's already active.
		const themeBanners = omit(
			{
				'photo-blog': PhotoBlogBanner,
				'small-business': SmallBusinessBanner,
			},
			currentThemeId
		);

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<div>
				<DocumentHead title={ title } meta={ metas } link={ links } />
				<PageViewTracker
					path={ this.props.analyticsPath }
					title={ this.props.analyticsPageTitle }
				/>
				{ ! isLoggedIn && (
					<SubMasterbarNav
						options={ headerIcons }
						fallback={ headerIcons[ 0 ] }
						uri={ this.constructUrl() }
					/>
				) }
				<div className="themes__content">
					<QueryThemeFilters />
					{ showBanners && abtest( 'builderReferralThemesBanner' ) === 'original' && (
						<RandomThemesBanner banners={ themeBanners } />
					) }
					{ showBanners && abtest( 'builderReferralThemesBanner' ) === 'builderReferralBanner' && (
						<UpworkBanner location={ 'theme-banner' } />
					) }
					<ThemesSearchCard
						onSearch={ this.doSearch }
						search={ filterString + search }
						tier={ tier }
						showTierThemesControl={ ! isMultisite }
						select={ this.onTierSelect }
					/>
					{ this.props.upsellBanner }
					{ this.showUploadButton() && (
						<Button
							className="themes__upload-button"
							compact
							onClick={ this.onUploadClick }
							href={ siteSlug ? `/themes/upload/${ siteSlug }` : '/themes/upload' }
						>
							<Gridicon icon="cloud-upload" />
							{ translate( 'Upload Theme' ) }
						</Button>
					) }
					<ThemesSelection
						upsellUrl={ this.props.upsellUrl }
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
						onScreenshotClick={ function( themeId ) {
							if ( ! getScreenshotOption( themeId ).action ) {
								return;
							}
							getScreenshotOption( themeId ).action( themeId );
						} }
						getActionLabel={ function( theme ) {
							return getScreenshotOption( theme ).label;
						} }
						getOptions={ function( theme ) {
							return pickBy(
								addTracking( options ),
								option => ! ( option.hideForTheme && option.hideForTheme( theme, siteId ) )
							);
						} }
						trackScrollPage={ this.props.trackScrollPage }
						emptyContent={ this.props.emptyContent }
					/>
					<ThemePreview />
					{ this.props.children }
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, filter, tier, vertical } ) => ( {
	currentThemeId: getActiveTheme( state, siteId ),
	isLoggedIn: !! getCurrentUserId( state ),
	siteSlug: getSiteSlug( state, siteId ),
	description: getThemeShowcaseDescription( state, { filter, tier, vertical } ),
	title: getThemeShowcaseTitle( state, { filter, tier, vertical } ),
	subjects: getThemeFilterTerms( state, 'subject' ) || {},
	filterString: prependThemeFilterKeys( state, filter ),
	filterToTermTable: getThemeFilterToTermTable( state ),
} );

const mapDispatchToProps = {
	trackUploadClick: () => recordTracksEvent( 'calypso_click_theme_upload' ),
	trackATUploadClick: () => recordTracksEvent( 'calypso_automated_transfer_click_theme_upload' ),
};
export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ThemeShowcase ) );
