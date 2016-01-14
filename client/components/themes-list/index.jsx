/**
 * External dependencies
 */
var React = require( 'react' ),
	times = require( 'lodash/utility/times' ),
	isEqual = require( 'lodash/lang/isEqual' );

/**
 * Internal dependencies
 */
var Theme = require( 'components/theme' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	PER_PAGE = require( 'state/themes/themes-list/constants' ).PER_PAGE;

/**
 * Component
 */
var ThemesList = React.createClass( {

	mixins: [ InfiniteScroll( 'fetchNextPage' ) ],

	propTypes: {
		themes: React.PropTypes.array.isRequired,
		emptyContent: React.PropTypes.element,
		loading: React.PropTypes.bool.isRequired,
		fetchNextPage: React.PropTypes.func.isRequired,
		getButtonOptions: React.PropTypes.func,
		onScreenshotClick: React.PropTypes.func.isRequired,
		onMoreButtonClick: React.PropTypes.func,
		getActionLabel: React.PropTypes.func
	},

	fetchNextPage: function( options ) {
		this.props.fetchNextPage( options );
	},

	getDefaultProps: function() {
		return {
			loading: false,
			themes: [],
			fetchNextPage: function() {},
			optionsGenerator: function() {
				return [];
			},
			getActionLabel: function() {
				return '';
			}
		};
	},

	shouldComponentUpdate: function( nextProps ) {
		return this.props.loading !== nextProps.loading ||
			! isEqual( this.props.themes, nextProps.themes );
	},

	renderTheme: function( theme, index ) {
		return <Theme
			key={ 'theme-' + theme.id }
			buttonContents={ this.props.getButtonOptions( theme ) }
			screenshotClickUrl={ this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme ) }
			onScreenshotClick={ this.props.onScreenshotClick }
			onMoreButtonClick={ this.props.onMoreButtonClick }
			actionLabel={ this.props.getActionLabel( theme ) }
			index={ index }
			theme={ theme } />;
	},

	renderLoadingPlaceholders: function() {
		return times( PER_PAGE, function( i ) {
			return <Theme key={ 'placeholder-' + i } theme={ { id: 'placeholder-' + i, name: 'Loading…' } } isPlaceholder={ true } />;
		} );
	},

	// Invisible trailing items keep all elements same width in flexbox grid.
	renderTrailingItems: function() {
		const NUM_SPACERS = 8; // gives enough spacers for a theoretical 9 column layout
		return times( NUM_SPACERS, function( i ) {
			return <div className="themes-list--spacer" key={ 'themes-list--spacer-' + i } />;
		} );
	},

	renderEmpty: function() {
		return this.props.emptyContent ||
			<EmptyContent
				title={ this.translate( 'Sorry, no themes found.' ) }
				line={ this.translate( 'Try a different search or more filters?' ) }
				/>;
	},

	render: function() {
		if ( ! this.props.loading && this.props.themes.length === 0 ) {
			return this.renderEmpty();
		}

		let themes = this.props.themes.map( this.renderTheme );

		if ( this.props.loading ) {
			themes.push( this.renderLoadingPlaceholders() );
		}

		themes.push( this.renderTrailingItems() );

		return (
			<div className="themes-list">
				{ themes }
			</div>
		);
	}
} );

module.exports = ThemesList;
