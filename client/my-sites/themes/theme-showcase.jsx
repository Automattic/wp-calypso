/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ThemePreview from './theme-preview';
import ThemesSelection from './themes-selection';
import StickyPanel from 'components/sticky-panel';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { addTracking, trackClick } from './helpers';
import DocumentHead from 'components/data/document-head';
import { getFilter, getSortedFilterTerms, stripFilters } from './theme-filters.js';
import buildUrl from 'lib/mixins/url-search/build-url';
import { getSiteSlug } from 'state/sites/selectors';
import config from 'config';

const ThemesSearchCard = config.isEnabled( 'manage/themes/magic-search' )
	? require( './themes-magic-search-card' )
	: require( './themes-search-card' );

const themesMeta = {
	'': {
		title: 'WordPress Themes',
		description: 'Beautiful, responsive, free and premium WordPress themes \
			for your photography site, portfolio, magazine, business website, or blog.',
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
		tier: PropTypes.oneOf( [ '', 'free', 'premium' ] ),
		search: PropTypes.string,
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		secondaryOption: optionShape,
		getScreenshotOption: PropTypes.func,
		siteSlug: PropTypes.string,
		showUploadButton: PropTypes.bool,

	},

	getDefaultProps() {
		return {
			tier: '',
			search: '',
			showUploadButton: true
		};
	},

	getInitialState() {
		return {
			page: 1,
			showPreview: false,
			previewingTheme: null,
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

	togglePreview( theme ) {
		this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
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

	onPrimaryPreviewButtonClick( theme ) {
		const option = this.getPrimaryOption();
		this.setState( { showPreview: false }, () => {
			option.action && option.action( theme );
		} );
	},

	onSecondaryPreviewButtonClick( theme ) {
		const { secondaryOption } = this.props;
		this.setState( { showPreview: false }, () => {
			secondaryOption && secondaryOption.action ? secondaryOption.action( theme ) : null;
		} );
	},

	getPrimaryOption() {
		if ( ! this.state.showPreview ) {
			return this.props.defaultOption;
		}
		const { translate } = this.props;
		const { purchase, activate } = this.props.options;
		const { price } = this.state.previewingTheme;
		let primaryOption = this.props.defaultOption;
		if ( price && purchase ) {
			primaryOption = purchase;
			primaryOption.label = translate( 'Pick this design' );
		} else if ( activate ) {
			primaryOption = activate;
			primaryOption.label = translate( 'Activate this design' );
		}
		return primaryOption;
	},

	render() {
		const { site, options, getScreenshotOption, secondaryOption, search, filter } = this.props;
		const tier = config.isEnabled( 'upgrades/premium-themes' ) ? this.props.tier : 'free';
		const primaryOption = this.getPrimaryOption();

		// If a preview action is passed, use that. Otherwise, use our own.
		if ( options.preview && ! options.preview.action ) {
			options.preview.action = theme => this.togglePreview( theme );
		}

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
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
						primaryButtonLabel={ primaryOption.label }
						getPrimaryButtonHref={ primaryOption.getUrl }
						onPrimaryButtonClick={ this.onPrimaryPreviewButtonClick }
						secondaryButtonLabel={ secondaryOption ? secondaryOption.label : null }
						getSecondaryButtonHref={ secondaryOption ? secondaryOption.getUrl : null }
						onSecondaryButtonClick={ this.onSecondaryPreviewButtonClick }
					/>
				}
				<StickyPanel>
					<ThemesSearchCard
						site={ site }
						onSearch={ this.doSearch }
						search={ this.prependFilterKeys() + search }
						tier={ tier }
						select={ this.onTierSelect } />
				</StickyPanel>
				<ThemesSelection
					search={ search }
					tier={ this.props.tier }
					filter={ filter }
					vertical={ this.props.vertical }
					siteId={ this.props.siteId }
					listLabel={ this.props.listLabel }
					showUploadButton={ this.props.showUploadButton }
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
							option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
				/>
				{ this.props.children }
			</Main>
		);
	}
} );

export default connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId ),
	} )
)( localize( ThemeShowcase ) );
