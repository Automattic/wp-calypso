/**
 * External dependencies
 */
import React from 'react';
import times from 'lodash/times';
import isEqual from 'lodash/isEqual';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import EmptyContent from 'components/empty-content';
import InfiniteScroll from 'lib/mixins/infinite-scroll';
import { PER_PAGE } from 'state/themes/themes-list/constants';

/**
 * Component
 */
export const ThemesList = React.createClass( {

	mixins: [ InfiniteScroll( 'fetchNextPage' ) ],

	propTypes: {
		themes: React.PropTypes.array.isRequired,
		emptyContent: React.PropTypes.element,
		loading: React.PropTypes.bool.isRequired,
		fetchNextPage: React.PropTypes.func.isRequired,
		getButtonOptions: React.PropTypes.func,
		onScreenshotClick: React.PropTypes.func.isRequired,
		onMoreButtonClick: React.PropTypes.func,
		getActionLabel: React.PropTypes.func,
		// i18n function provided by localize()
		translate: React.PropTypes.func
	},

	fetchNextPage( options ) {
		this.props.fetchNextPage( options );
	},

	getDefaultProps() {
		return {
			loading: false,
			themes: [],
			fetchNextPage() {},
			optionsGenerator() {
				return [];
			},
			getActionLabel() {
				return '';
			}
		};
	},

	shouldComponentUpdate( nextProps ) {
		return this.props.loading !== nextProps.loading ||
			! isEqual( this.props.themes, nextProps.themes );
	},

	renderTheme( theme, index ) {
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

	renderLoadingPlaceholders() {
		return times( PER_PAGE, function( i ) {
			return <Theme key={ 'placeholder-' + i } theme={ { id: 'placeholder-' + i, name: 'Loading…' } } isPlaceholder={ true } />;
		} );
	},

	// Invisible trailing items keep all elements same width in flexbox grid.
	renderTrailingItems() {
		const NUM_SPACERS = 8; // gives enough spacers for a theoretical 9 column layout
		return times( NUM_SPACERS, function( i ) {
			return <div className="themes-list--spacer" key={ 'themes-list--spacer-' + i } />;
		} );
	},

	renderEmpty() {
		return this.props.emptyContent ||
			<EmptyContent
				title={ this.props.translate( 'Sorry, no themes found.' ) }
				line={ this.props.translate( 'Try a different search or more filters?' ) }
				/>;
	},

	render() {
		if ( ! this.props.loading && this.props.themes.length === 0 ) {
			return this.renderEmpty();
		}

		return (
			<div className="themes-list">
				{ this.props.themes.map( this.renderTheme ) }
				{ this.props.loading && this.renderLoadingPlaceholders() }
				{ this.renderTrailingItems() }
			</div>
		);
	}
} );

export default localize( ThemesList );
