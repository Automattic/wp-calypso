/**
 * External dependencies
 */
import React from 'react';
import times from 'lodash/times';
import { localize } from 'i18n-calypso';
import { identity, isEqual, noop } from 'lodash';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Theme from 'components/theme';
import EmptyContent from 'components/empty-content';
import InfiniteScroll from 'lib/mixins/infinite-scroll';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

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
		// i18n function provided by localize()
		translate: React.PropTypes.func,
		showThemeUpload: React.PropTypes.bool,
		themeUploadClickRecorder: React.PropTypes.func,
		onThemeUpload: React.PropTypes.func,
		placeholderCount: React.PropTypes.number
	},

	fetchNextPage( options ) {
		this.props.fetchNextPage( options );
	},

	getDefaultProps() {
		return {
			loading: false,
			themes: [],
			showThemeUpload: false,
			themeUploadClickRecorder: identity,
			onThemeUpload: identity,
			fetchNextPage: noop,
			placeholderCount: DEFAULT_THEME_QUERY.number,
			optionsGenerator: () => [],
			getActionLabel: () => '',
			isActive: () => false,
			isPurchased: () => false,
			isInstalling: () => false
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
			screenshotClickUrl={ this.props.getScreenshotUrl && this.props.getScreenshotUrl( theme ) }
			onScreenshotClick={ this.props.onScreenshotClick }
			onMoreButtonClick={ this.props.onMoreButtonClick }
			actionLabel={ this.props.getActionLabel( theme ) }
			index={ index }
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

	handleUploadThemeClick() {
		this.props.themeUploadClickRecorder(); // tracking
		this.props.onThemeUpload();            // redirect
	},

	renderThemeUploadBox() {
		this.props.themes.pop();
		return (
			<Card className="theme themes-list__upload-container">
				<Gridicon className="themes-list__upload-icon" icon="cloud-upload" size={ 100 } />
				<div className="themes-list__upload-text">
					{ this.props.translate( 'I already have a theme I\'d like to use for my website.' ) }
				</div>
				<Button
					primary
					onClick={ this.handleUploadThemeClick }
					className="themes-list__upload-button"
				>
					{ this.props.translate( 'Upload Theme' ) }
				</Button>
			</Card>
		);
	},

	render() {
		if ( ! this.props.loading && this.props.themes.length === 0 ) {
			return this.renderEmpty();
		}

		return (
			<div className="themes-list">
				{ this.props.showThemeUpload && this.renderThemeUploadBox() }
				{ this.props.themes.map( this.renderTheme ) }
				{ this.props.loading && this.renderLoadingPlaceholders() }
				{ this.renderTrailingItems() }
			</div>
		);
	}
} );

const mapDispatchToProps = dispatch => ( {
	themeUploadClickRecorder: () =>
		dispatch( recordTracksEvent( 'calypso_signup_theme_upload_click' ) )
} );

export default connect( null, mapDispatchToProps )( localize( ThemesList ) );
