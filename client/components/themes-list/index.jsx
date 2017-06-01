/**
 * External dependencies
 */
import React from 'react';
import times from 'lodash/times';
import { localize } from 'i18n-calypso';
import { isEqual, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import EmptyContent from 'components/empty-content';
import InfiniteScroll from 'lib/mixins/infinite-scroll';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';
import config from 'config';

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
		isActive: React.PropTypes.func,
		isPurchased: React.PropTypes.func,
		isInstalling: React.PropTypes.func,
		isJetpack: React.PropTypes.bool,
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
			fetchNextPage: noop,
			placeholderCount: DEFAULT_THEME_QUERY.number,
			optionsGenerator: () => [],
			getActionLabel: () => '',
			isActive: () => false,
			isPurchased: () => false,
			isInstalling: () => false,
			isJetpack: false
		};
	},

	shouldComponentUpdate( nextProps ) {
		return nextProps.loading !== this.props.loading ||
			! isEqual( nextProps.themes, this.props.themes ) ||
			( nextProps.getButtonOptions !== this.props.getButtonOptions ) ||
			( nextProps.getScreenshotUrl !== this.props.getScreenshotUrl ) ||
			( nextProps.onScreenshotClick !== this.props.onScreenshotClick ) ||
			( nextProps.onMoreButtonClick !== this.props.onMoreButtonClick );
	},

	renderTheme( theme, index ) {
		return <Theme
			key={ 'theme-' + theme.id }
			buttonContents={ this.props.getButtonOptions( theme.id ) }
			screenshotClickUrl={ this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme.id ) }
			onScreenshotClick={ this.props.onScreenshotClick }
			onMoreButtonClick={ this.props.onMoreButtonClick }
			actionLabel={ this.props.getActionLabel( theme.id ) }
			index={ index }
			isJetpack={ config.isEnabled( 'jetpack/pijp' ) && this.props.isJetpack }
			theme={ theme }
			active={ this.props.isActive( theme.id ) }
			purchased={ this.props.isPurchased( theme.id ) }
			installing={ this.props.isInstalling( theme.id ) } />;
	},

	renderLoadingPlaceholders() {
		return times( this.props.placeholderCount, function( i ) {
			return <Theme key={ 'placeholder-' + i } theme={ { id: 'placeholder-' + i, name: 'Loading…' } } isPlaceholder={ true } />;
		} );
	},

	// Invisible trailing items keep all elements same width in flexbox grid.
	renderTrailingItems() {
		const NUM_SPACERS = 11; // gives enough spacers for a theoretical 12 column layout
		return times( NUM_SPACERS, function( i ) {
			return <div className="themes-list__spacer" key={ 'themes-list__spacer-' + i } />;
		} );
	},

	renderEmpty() {
		return this.props.emptyContent ||
			<EmptyContent
				illustration="/calypso/images/illustrations/no-themes-drake.svg"
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
