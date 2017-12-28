/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { isEqual, noop, times } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Theme from 'client/components/theme';
import EmptyContent from 'client/components/empty-content';
import InfiniteScroll from 'client/lib/mixins/infinite-scroll';
import { DEFAULT_THEME_QUERY } from 'client/state/themes/constants';

/**
 * Component
 */
/* eslint-disable react/prefer-es6-class */
export const ThemesList = createReactClass( {
	displayName: 'ThemesList',
	mixins: [ InfiniteScroll( 'fetchNextPage' ) ],

	propTypes: {
		themes: PropTypes.array.isRequired,
		emptyContent: PropTypes.element,
		loading: PropTypes.bool.isRequired,
		fetchNextPage: PropTypes.func.isRequired,
		getButtonOptions: PropTypes.func,
		onScreenshotClick: PropTypes.func.isRequired,
		onMoreButtonClick: PropTypes.func,
		getActionLabel: PropTypes.func,
		isActive: PropTypes.func,
		getPrice: PropTypes.func,
		isInstalling: PropTypes.func,
		// i18n function provided by localize()
		translate: PropTypes.func,
		placeholderCount: PropTypes.number,
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
			getPrice: () => '',
			isInstalling: () => false,
		};
	},

	shouldComponentUpdate( nextProps ) {
		return (
			nextProps.loading !== this.props.loading ||
			! isEqual( nextProps.themes, this.props.themes ) ||
			nextProps.getButtonOptions !== this.props.getButtonOptions ||
			nextProps.getScreenshotUrl !== this.props.getScreenshotUrl ||
			nextProps.onScreenshotClick !== this.props.onScreenshotClick ||
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick
		);
	},

	renderTheme( theme, index ) {
		return (
			<Theme
				key={ 'theme-' + theme.id }
				buttonContents={ this.props.getButtonOptions( theme.id ) }
				screenshotClickUrl={
					this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme.id )
				}
				onScreenshotClick={ this.props.onScreenshotClick }
				onMoreButtonClick={ this.props.onMoreButtonClick }
				actionLabel={ this.props.getActionLabel( theme.id ) }
				index={ index }
				theme={ theme }
				active={ this.props.isActive( theme.id ) }
				price={ this.props.getPrice( theme.id ) }
				installing={ this.props.isInstalling( theme.id ) }
				upsellUrl={ this.props.upsellUrl }
			/>
		);
	},

	renderLoadingPlaceholders() {
		return times( this.props.placeholderCount, function( i ) {
			return (
				<Theme
					key={ 'placeholder-' + i }
					theme={ { id: 'placeholder-' + i, name: 'Loading…' } }
					isPlaceholder={ true }
				/>
			);
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
		return (
			this.props.emptyContent || (
				<EmptyContent
					illustration="/calypso/images/illustrations/no-themes-drake.svg"
					title={ this.props.translate( 'Sorry, no themes found.' ) }
					line={ this.props.translate( 'Try a different search or more filters?' ) }
				/>
			)
		);
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
	},
} );

export default localize( ThemesList );
