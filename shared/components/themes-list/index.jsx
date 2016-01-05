/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import times from 'lodash/utility/times';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import EmptyContent from 'components/empty-content';
import InfiniteList from 'components/infinite-list';
import { THEME_COMPONENT_HEIGHT as ITEM_HEIGHT } from 'lib/themes/constants';
import PER_PAGE from 'lib/themes/constants';
import { isDesktop, isWithinBreakpoint } from 'lib/viewport';
import Debug from 'debug';

const debug = new Debug( 'calypso:themes:themes-list' );

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

	getInitialState: function() {
		return { numColumns: 3 }
	},

	componentDidMount: function() {
		this.setState( { numColumns: this.getNumColumns() } );

		window.addEventListener( 'resize', this.onWindowResize );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.onWindowResize );
	},

	onWindowResize: function() {
		const numColumns = this.getNumColumns();
		if ( numColumns !== this.state.numColumns ) {
			this.setState( { numColumns } );
		}
	},

	getThemeRef: function( theme ) {
		return 'theme-' + theme.id;
	},

	getNumColumns: function() {
		const componentWidth = this.refs.themesList.clientWidth;
		const themeWidth = 240;

		const numColumns = Math.floor( componentWidth / themeWidth ) || 1;
		debug( 'numColumns: ', numColumns );
		return numColumns;
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
		return times( this.state.numColumns, function( i ) {
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

	renderList: function() {
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
				itemsPerRow={ this.state.numColumns }
			/>
		);
	},

	render: function() {
		const empty = ! this.props.loading && this.props.themes.length === 0;
		return (
			<div ref="themesList">
				{ empty ? this.renderEmpty() : this.renderList() }
			</div>
		);
	}
} );

module.exports = ThemesList;
