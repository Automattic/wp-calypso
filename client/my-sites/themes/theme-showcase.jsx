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
import SubMasterbarNav from 'components/sub-masterbar-nav';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { addTracking, trackClick } from './helpers';
import DocumentHead from 'components/data/document-head';
import { prependFilterKeys, getSortedFilterTerms, stripFilters, getSubjects } from './theme-filters.js';
import buildUrl from 'lib/mixins/url-search/build-url';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import ThemePreview from './theme-preview';
import config from 'config';
import { isATEnabledForCurrentSite } from 'lib/automated-transfer';

const ThemesSearchCard = config.isEnabled( 'manage/themes/magic-search' )
	? require( './themes-magic-search-card' )
	: require( './themes-search-card' );

const themesMeta = {
	'': {
		title: 'WordPress Themes',
		description: 'Beautiful, responsive, free and premium WordPress themes ' +
			'for your photography site, portfolio, magazine, business website, or blog.',
		canonicalUrl: 'https://wordpress.com/themes',
	},
	free: {
		title: 'Free WordPress Themes',
		description: 'Discover Free WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/themes/free',
	},
	premium: {
		title: 'Premium WordPress Themes',
		description: 'Discover Premium WordPress Themes on the WordPress.com Theme Showcase.',
		canonicalUrl: 'https://wordpress.com/themes/premium',
	}
};

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

		const url = `/themes${ verticalSection }${ tierSection }${ filterSection }${ siteIdSection }`;
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
			( isJetpack || isATEnabledForCurrentSite() )
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
			vertical,
			isLoggedIn
		} = this.props;
		const tier = config.isEnabled( 'upgrades/premium-themes' ) ? this.props.tier : 'free';

		const metas = [
			{ name: 'description', property: 'og:description', content: themesMeta[ tier ].description },
			{ property: 'og:url', content: themesMeta[ tier ].canonicalUrl },
			{ property: 'og:type', content: 'website' }
		];

		const headerIcons = [ {
			label: 'new',
			uri: '/design',
			icon: 'star'
		} ].concat(
			getSubjects()
				.map( subject => subjectsMeta[ subject ] && {
					label: subject,
					uri: `/design/${ subject }`,
					icon: subjectsMeta[ subject ].icon,
					order: subjectsMeta[ subject ].order
				} )
				.filter( icon => !! icon )
				.sort( ( a, b ) => a.order - b.order )
		);

		const verticalSection = vertical ? `/${ vertical }` : '';

		// FIXME: Logged-in title should only be 'Themes'
		return (
			<Main className="themes">
				<DocumentHead title={ themesMeta[ tier ].title } meta={ metas } />
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle } />
				{ ! isLoggedIn && (
					<SubMasterbarNav
						options={ headerIcons }
						fallback={ headerIcons[ 0 ] }
						uri={ `/design${ verticalSection }` } />
				)}
				<div className="themes__content">
					<ThemesSearchCard
						onSearch={ this.doSearch }
						search={ prependFilterKeys( filter ) + search }
						tier={ tier }
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

export default connect(
	( state, { siteId } ) => ( {
		isLoggedIn: !! getCurrentUserId( state ),
		siteSlug: getSiteSlug( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
	} )
)( localize( ThemeShowcase ) );
