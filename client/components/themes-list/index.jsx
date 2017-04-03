/**
 * External dependencies
 */
import React from 'react';
import { findDOMNode } from 'react-dom';
import times from 'lodash/times';
import { localize } from 'i18n-calypso';
import { isEqual, noop } from 'lodash';
import { InfiniteLoader, WindowScroller, AutoSizer, Grid } from 'react-virtualized';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import EmptyContent from 'components/empty-content';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';

/**
 * Component
 */
export const ThemesList = React.createClass( {

	propTypes: {
		themes: React.PropTypes.array.isRequired,
		themesCount: React.PropTypes.number,
		emptyContent: React.PropTypes.element,
		loading: React.PropTypes.bool.isRequired,
		fetchNextPage: React.PropTypes.func.isRequired,
		getButtonOptions: React.PropTypes.func,
		onScreenshotClick: React.PropTypes.func.isRequired,
		onMoreButtonClick: React.PropTypes.func,
		getActionLabel: React.PropTypes.func,
		isActive: React.PropTypes.func,
		isPurchased: React.PropTypes.func,
		isInstalling: React.PropTypes.func,
		// i18n function provided by localize()
		translate: React.PropTypes.func,
		placeholderCount: React.PropTypes.number
	},

	fetchNextPage( options ) {
		this.props.fetchNextPage( options );
	},

	getDefaultProps() {
		return {
			loading: false,
			themes: [],
			themesCount: 0,
			fetchNextPage: noop,
			placeholderCount: DEFAULT_THEME_QUERY.number,
			optionsGenerator: () => [],
			getActionLabel: () => '',
			isActive: () => false,
			isPurchased: () => false,
			isInstalling: () => false
		};
	},

	isRowLoaded( { index } ) {
		return !! this.props.themes[ index ];
	},

	componentDidMount() {
		this._width = findDOMNode( this ).offsetWidth;
	},

	shouldComponentUpdate( nextProps ) {
		return nextProps.loading !== this.props.loading ||
			! isEqual( nextProps.themes, this.props.themes ) ||
			( nextProps.getButtonOptions !== this.props.getButtonOptions ) ||
			( nextProps.getScreenshotUrl !== this.props.getScreenshotUrl ) ||
			( nextProps.onScreenshotClick !== this.props.onScreenshotClick ) ||
			( nextProps.onMoreButtonClick !== this.props.onMoreButtonClick );
	},

	getItemsPerRow( rowWidth ) {
		return Math.floor( ( rowWidth || this._width ) / 250 );
	},

	loadMoreRows() {
		return this.fetchNextPage( { triggeredByScroll: true } );
	},

	onSectionRendered( { columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex }, onRowsRendered ) {
		const startIndex = rowStartIndex * this.getItemsPerRow() + columnStartIndex;
		const stopIndex = rowStopIndex * this.getItemsPerRow() + columnStopIndex;

		onRowsRendered( {
			startIndex,
			stopIndex
		} );
	},

	onResize( { width } ) {
		this._width = width;
	},

	render() {
		if ( ! this.props.loading && this.props.themes.length === 0 ) {
			return this.renderEmpty();
		}

		return (
			<div className="themes-list">
				<InfiniteLoader
					isRowLoaded={ this.isRowLoaded }
					loadMoreRows={ this.loadMoreRows }
					rowCount={ 1000 }
					threshold={ 20 }
				>
					{ ( { onRowsRendered, registerChild } ) => (
						<WindowScroller>
							{ ( { height, scrollTop } ) => (
								<AutoSizer disableHeight onResize={ this.onResize }>
									{ ( { width } ) => {
										return this.renderGrid( width, height, scrollTop, registerChild, onRowsRendered );
									} }
								</AutoSizer>
							) }
						</WindowScroller>
					) }
				</InfiniteLoader>
			</div>
		);
	},

	renderGrid( width, height, scrollTop, registerChild, onRowsRendered ) {
		const columnCount = this.getItemsPerRow( width );
		const rowCount = Math.ceil( this.props.themesCount / columnCount );

		const onSectionRendered = ( args ) => this.onSectionRendered( args, onRowsRendered );

		return (
			<Grid
				width={ width }
				height={ height }
				autoHeight={ true }
				columnCount={ columnCount }
				columnWidth={ Math.floor( width / columnCount ) }
				rowCount={ rowCount }
				rowHeight={ Math.floor( ( ( width / columnCount ) - 20 ) * 0.75 ) + 74 }
				scrollTop={ scrollTop }
				cellRenderer={ this.renderCell }
				onSectionRendered={ onSectionRendered }
				ref={ registerChild }
			/>
		);
	},

	renderCell( { rowIndex, columnIndex, key, style } ) {
		const index = rowIndex * this.getItemsPerRow() + columnIndex;
		const theme = this.props.themes[ index ];

		return (
			<div key={ key } className="themes-list__cell" style={ style }>
				{ theme
					? this.renderTheme( theme, index )
					: this.renderLoadingPlaceholder( index )
				}
			</div>
		);
	},

	renderTheme( theme, index ) {
		return (
			<Theme
				key={ 'theme-' + theme.id }
				buttonContents={ this.props.getButtonOptions( theme.id ) }
				screenshotClickUrl={ this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme.id ) }
				onScreenshotClick={ this.props.onScreenshotClick }
				onMoreButtonClick={ this.props.onMoreButtonClick }
				actionLabel={ this.props.getActionLabel( theme.id ) }
				index={ index }
				theme={ theme }
				active={ this.props.isActive( theme.id ) }
				purchased={ this.props.isPurchased( theme.id ) }
				installing={ this.props.isInstalling( theme.id ) }
			/>
		);
	},

	renderLoadingPlaceholder( index ) {
		return (
			<Theme
				key={ 'placeholder-' + index }
				theme={ { id: 'placeholder-' + index, name: 'Loading…' } }
				isPlaceholder={ true }
			/>
		);
	},

	// Invisible trailing items keep all elements same width in flexbox grid.
	renderTrailingItems() {
		const NUM_SPACERS = 11; // gives enough spacers for a theoretical 12 column layout
		return times( NUM_SPACERS, function( i ) {
			return <div className="themes-list--spacer" key={ 'themes-list--spacer-' + i } />;
		} );
	},

	renderEmpty() {
		return this.props.emptyContent || (
			<EmptyContent
				title={ this.props.translate( 'Sorry, no themes found.' ) }
				line={ this.props.translate( 'Try a different search or more filters?' ) }
			/>
		);
	}
} );

export default localize( ThemesList );
