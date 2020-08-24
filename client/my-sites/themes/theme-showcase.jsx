/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { compact, pickBy } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { Button } from '@automattic/components';
import ThemesSelection from './themes-selection';
import SubMasterbarNav from 'components/sub-masterbar-nav';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { addTracking, trackClick } from './helpers';
import DocumentHead from 'components/data/document-head';
import { buildRelativeSearchUrl } from 'lib/build-url';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import ThemePreview from './theme-preview';
import config from 'config';
import { recordTracksEvent } from 'state/analytics/actions';
import { openThemesShowcase } from 'state/themes/themes-ui/actions';
import {
	getThemesBookmark,
	hasShowcaseOpened as hasShowcaseOpenedSelector,
} from 'state/themes/themes-ui/selectors';
import ThemesSearchCard from './themes-magic-search-card';
import QueryThemeFilters from 'components/data/query-theme-filters';
import {
	getActiveTheme,
	getThemeFilterTerms,
	getThemeFilterToTermTable,
	getThemeShowcaseDescription,
	getThemeShowcaseTitle,
	prependThemeFilterKeys,
} from 'state/themes/selectors';
import UpworkBanner from 'blocks/upwork-banner';
import RecommendedThemes from './recommended-themes';

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
	constructor( props ) {
		super( props );
		this.scrollRef = React.createRef();
		this.bookmarkRef = React.createRef();
		this.state = {
			page: 1,
			showPreview: false,
			isShowcaseOpen: !! (
				this.props.loggedOutComponent ||
				this.props.search ||
				this.props.filter ||
				this.props.tier ||
				this.props.hasShowcaseOpened
			),
		};
	}

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
		trackMoreThemesClick: PropTypes.func,
		loggedOutComponent: PropTypes.bool,
	};

	static defaultProps = {
		tier: '',
		search: '',
		emptyContent: null,
		upsellBanner: false,
		showUploadButton: true,
	};

	componentDidMount() {
		const { search, filter, tier, hasShowcaseOpened, themesBookmark } = this.props;
		// Open showcase on state if we open here with query override.
		if ( ( search || filter || tier ) && ! hasShowcaseOpened ) {
			this.props.openThemesShowcase();
		}
		// Scroll to bookmark if applicable.
		if ( themesBookmark ) {
			// Timeout to move this to the end of the event queue or it won't work here.
			setTimeout( () => {
				const lastTheme = this.bookmarkRef.current;
				if ( lastTheme ) {
					lastTheme.scrollIntoView( {
						behavior: 'auto',
						block: 'center',
						inline: 'center',
					} );
				}
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if (
			prevProps.search !== this.props.search ||
			prevProps.filter !== this.props.filter ||
			prevProps.tier !== this.props.tier
		) {
			this.scrollToSearchInput();
		}
	}

	scrollToSearchInput = () => {
		if ( ! this.props.loggedOutComponent && this.scrollRef && this.scrollRef.current ) {
			this.scrollRef.current.scrollIntoView();
		}
	};

	toggleShowcase = () => {
		this.setState( { isShowcaseOpen: ! this.state.isShowcaseOpen } );
		this.props.openThemesShowcase();
		this.props.trackMoreThemesClick();
	};

	doSearch = ( searchBoxContent ) => {
		const filterRegex = /([\w-]*):([\w-]*)/g;
		const { filterToTermTable } = this.props;

		const filters = searchBoxContent.match( filterRegex ) || [];
		const validFilters = filters.map( ( filter ) => filterToTermTable[ filter ] );

		const url = this.constructUrl( {
			filter: compact( validFilters ).join( '+' ),
			// Strip filters and excess whitespace
			searchString: searchBoxContent.replace( filterRegex, '' ).replace( /\s+/g, ' ' ).trim(),
		} );
		page( url );
		this.scrollToSearchInput();
	};

	/**
	 * Returns a full showcase url from current props.
	 *
	 * @param {object} sections fields from this object will override current props.
	 * @param {string} sections.vertical override vertical prop
	 * @param {string} sections.tier override tier prop
	 * @param {string} sections.filter override filter prop
	 * @param {string} sections.siteSlug override siteSlug prop
	 * @param {string} sections.searchString override searchString prop
	 *
	 * @returns {string} Theme showcase url
	 */
	constructUrl = ( sections ) => {
		const { vertical, tier, filter, siteSlug, searchString } = { ...this.props, ...sections };

		const siteIdSection = siteSlug ? `/${ siteSlug }` : '';
		const verticalSection = vertical ? `/${ vertical }` : '';
		const tierSection = tier && tier !== 'all' ? `/${ tier }` : '';

		let filterSection = filter ? `/filter/${ filter }` : '';
		filterSection = filterSection.replace( /\s/g, '+' );

		const url = `/themes${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
		return buildRelativeSearchUrl( url, searchString );
	};

	onTierSelect = ( { value: tier } ) => {
		trackClick( 'search bar filter', tier );
		const url = this.constructUrl( { tier } );
		page( url );
		this.scrollToSearchInput();
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
					( subject ) =>
						subjectsMeta[ subject ] && {
							label: subject,
							uri: this.constructUrl( { vertical: subject } ),
							icon: subjectsMeta[ subject ].icon,
							order: subjectsMeta[ subject ].order,
						}
				)
				.filter( ( icon ) => !! icon )
				.sort( ( a, b ) => a.order - b.order )
		);

		const showBanners = currentThemeId || ! siteId || ! isLoggedIn;

		const { isShowcaseOpen } = this.state;
		const isQueried = this.props.search || this.props.filter || this.props.tier;
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
					{ this.showUploadButton() && (
						<Button
							className="themes__upload-button"
							compact
							onClick={ this.onUploadClick }
							href={ siteSlug ? `/themes/upload/${ siteSlug }` : '/themes/upload' }
						>
							<Gridicon icon="cloud-upload" />
							{ translate( 'Install theme' ) }
						</Button>
					) }
					{ ! this.props.loggedOutComponent && ! isQueried && (
						<>
							<RecommendedThemes
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
								getScreenshotUrl={ function ( theme ) {
									if ( ! getScreenshotOption( theme ).getUrl ) {
										return null;
									}
									return getScreenshotOption( theme ).getUrl( theme );
								} }
								onScreenshotClick={ function ( themeId ) {
									if ( ! getScreenshotOption( themeId ).action ) {
										return;
									}
									getScreenshotOption( themeId ).action( themeId );
								} }
								getActionLabel={ function ( theme ) {
									return getScreenshotOption( theme ).label;
								} }
								getOptions={ function ( theme ) {
									return pickBy(
										addTracking( options ),
										( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, siteId ) )
									);
								} }
								trackScrollPage={ this.props.trackScrollPage }
								emptyContent={ this.props.emptyContent }
								isShowcaseOpen={ isShowcaseOpen }
								scrollToSearchInput={ this.scrollToSearchInput }
								bookmarkRef={ this.bookmarkRef }
							/>
							<div className="theme-showcase__open-showcase-button-holder">
								{ isShowcaseOpen ? (
									<hr />
								) : (
									<Button onClick={ this.toggleShowcase } data-e2e-value="open-themes-button">
										{ translate( 'Show all themes' ) }
									</Button>
								) }
							</div>
						</>
					) }

					<div
						ref={ this.scrollRef }
						className={
							! isShowcaseOpen
								? 'themes__hidden-content theme-showcase__all-themes'
								: 'theme-showcase__all-themes'
						}
					>
						{ ! this.props.loggedOutComponent && (
							<>
								<h2>
									<strong>{ translate( 'Advanced Themes' ) }</strong>
								</h2>
								<p>
									{ translate(
										'These themes offer more power and flexibility, but can be harder to setup and customize.'
									) }
								</p>
								{ showBanners &&
									abtest &&
									abtest( 'builderReferralThemesBanner' ) === 'builderReferralBanner' && (
										<UpworkBanner location={ 'theme-banner' } />
									) }
							</>
						) }
						<QueryThemeFilters />

						<ThemesSearchCard
							onSearch={ this.doSearch }
							search={ filterString + search }
							tier={ tier }
							showTierThemesControl={ ! isMultisite }
							select={ this.onTierSelect }
						/>
						{ this.props.upsellBanner }

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
							getScreenshotUrl={ function ( theme ) {
								if ( ! getScreenshotOption( theme ).getUrl ) {
									return null;
								}
								return getScreenshotOption( theme ).getUrl( theme );
							} }
							onScreenshotClick={ function ( themeId ) {
								if ( ! getScreenshotOption( themeId ).action ) {
									return;
								}
								getScreenshotOption( themeId ).action( themeId );
							} }
							getActionLabel={ function ( theme ) {
								return getScreenshotOption( theme ).label;
							} }
							getOptions={ function ( theme ) {
								return pickBy(
									addTracking( options ),
									( option ) => ! ( option.hideForTheme && option.hideForTheme( theme, siteId ) )
								);
							} }
							trackScrollPage={ this.props.trackScrollPage }
							emptyContent={ this.props.emptyContent }
							bookmarkRef={ this.bookmarkRef }
						/>
						<ThemePreview />
						{ this.props.children }
					</div>
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
	hasShowcaseOpened: hasShowcaseOpenedSelector( state ),
	themesBookmark: getThemesBookmark( state ),
} );

const mapDispatchToProps = {
	trackUploadClick: () => recordTracksEvent( 'calypso_click_theme_upload' ),
	trackATUploadClick: () => recordTracksEvent( 'calypso_automated_transfer_click_theme_upload' ),
	trackMoreThemesClick: () => recordTracksEvent( 'calypso_themeshowcase_more_themes_clicked' ),
	openThemesShowcase: () => openThemesShowcase(),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ThemeShowcase ) );
