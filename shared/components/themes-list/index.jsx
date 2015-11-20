/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	times = require( 'lodash/utility/times' );

/**
 * Internal dependencies
 */
var Theme = require( 'components/theme' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	ITEM_HEIGHT = require( 'lib/themes/constants' ).THEME_COMPONENT_HEIGHT,
	PER_PAGE = require( 'lib/themes/constants' ).PER_PAGE;

/**
 * Component
 */
var ThemesList = React.createClass( {
	propTypes: {
		themes: React.PropTypes.array.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		emptyContent: React.PropTypes.element,
		loading: React.PropTypes.bool.isRequired,
		fetchNextPage: React.PropTypes.func.isRequired,
		getButtonOptions: React.PropTypes.func,
		onScreenshotClick: React.PropTypes.func.isRequired,
		onMoreButtonClick: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			loading: false,
			lastPage: false,
			themes: [],
			fetchNextPage: function() {},
			optionsGenerator: function() {
				return [];
			},
		};
	},

	getThemeRef: function( theme ) {
		return 'theme-' + theme.id;
	},

	renderTheme: function( theme, index ) {
		var key = this.getThemeRef( theme );
		return <Theme ref={ key }
			key={ key }
			buttonContents={ this.props.getButtonOptions( theme ) }
			screenshotClickUrl={ this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme ) }
			onScreenshotClick={ this.props.onScreenshotClick && this.props.onScreenshotClick.bind( null, theme, index ) }
			onMoreButtonClick={ this.props.onMoreButtonClick.bind( null, theme, index ) }
			index={ index }
			{ ...theme } />;
	},

	renderLoadingPlaceholders: function() {
		return times( PER_PAGE, function( i ) {
			return <Theme key={ 'placeholder-' + i } id={ 'placeholder-' + i } name="Loading…" isPlaceholder={ true } />;
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

		return (
			<InfiniteList
				key={ 'list' + this.props.search }
				className="themes-list"
				items={ this.props.themes }
				lastPage={ this.props.lastPage }
				fetchingNextPage={ this.props.loading }
				guessedItemHeight={ ITEM_HEIGHT }
				fetchNextPage={ this.props.fetchNextPage }
				getItemRef={ this.getThemeRef }
				renderItem={ this.renderTheme }
				renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				renderTrailingItems={ this.renderTrailingItems }
				itemsPerRow={ 2 }
			/>
		);
	}
} );

module.exports = ThemesList;
