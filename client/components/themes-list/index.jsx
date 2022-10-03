import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';

import './style.scss';

const noop = () => {};

export const ThemesList = ( props ) => {
	const fetchNextPage = useCallback(
		( options ) => {
			props.fetchNextPage( options );
		},
		[ props.fetchNextPage ]
	);

	if ( props.isLoading && props.themes.length === 0 ) {
		return <Empty emptyContent={ props.emptyContent } translate={ props.translate } />;
	}

	return (
		<div className="themes-list">
			{ props.themes.map( ( theme, index ) => (
				<ThemeBlock key={ 'theme-block' + index } theme={ theme } index={ index } { ...props } />
			) ) }
			{ props.loading && <LoadingPlaceholders placeholderCount={ props.placeholderCount } /> }
			{ /* Invisible trailing items keep all elements same width in flexbox grid. */ }
			<TrailingItems />
			<InfiniteScroll nextPageMethod={ fetchNextPage } />
		</div>
	);
};

ThemesList.propTypes = {
	themes: PropTypes.array.isRequired,
	emptyContent: PropTypes.element,
	loading: PropTypes.bool.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	fetchNextPage: PropTypes.func.isRequired,
	getButtonOptions: PropTypes.func,
	getScreenshotUrl: PropTypes.func,
	onScreenshotClick: PropTypes.func.isRequired,
	onMoreButtonClick: PropTypes.func,
	getActionLabel: PropTypes.func,
	isActive: PropTypes.func,
	getPrice: PropTypes.func,
	isInstalling: PropTypes.func,
	// i18n function provided by localize()
	translate: PropTypes.func,
	placeholderCount: PropTypes.number,
	bookmarkRef: PropTypes.oneOfType( [
		PropTypes.func,
		PropTypes.shape( { current: PropTypes.any } ),
	] ),
	siteId: PropTypes.number,
	searchTerm: PropTypes.string,
};

ThemesList.defaultProps = {
	loading: false,
	searchTerm: '',
	themes: [],
	recordTracksEvent: noop,
	fetchNextPage: noop,
	placeholderCount: DEFAULT_THEME_QUERY.number,
	optionsGenerator: () => [],
	getActionLabel: () => '',
	isActive: () => false,
	getPrice: () => '',
	isInstalling: () => false,
};

function ThemeBlock( props ) {
	const { theme, index } = props;
	if ( isEmpty( theme ) ) {
		return null;
	}
	// Decide if we should pass ref for bookmark.
	const { themesBookmark, siteId } = props;
	const bookmarkRef = themesBookmark === theme.id ? props.bookmarkRef : null;

	return (
		<Theme
			key={ 'theme-' + theme.id }
			buttonContents={ props.getButtonOptions( theme.id ) }
			screenshotClickUrl={ props.getScreenshotUrl && props.getScreenshotUrl( theme.id ) }
			onScreenshotClick={ props.onScreenshotClick }
			onMoreButtonClick={ props.onMoreButtonClick }
			actionLabel={ props.getActionLabel( theme.id ) }
			index={ index }
			theme={ theme }
			active={ props.isActive( theme.id ) }
			price={ props.getPrice( theme.id ) }
			installing={ props.isInstalling( theme.id ) }
			upsellUrl={ props.upsellUrl }
			bookmarkRef={ bookmarkRef }
			siteId={ siteId }
		/>
	);
}

function Empty( { emptyContent, translate } ) {
	return (
		emptyContent || (
			<EmptyContent
				title={ translate( 'Sorry, no themes found.' ) }
				line={ translate( 'Try a different search or more filters?' ) }
			/>
		)
	);
}

function LoadingPlaceholders( { placeholderCount } ) {
	return times( placeholderCount, function ( i ) {
		return (
			<Theme
				key={ 'placeholder-' + i }
				theme={ { id: 'placeholder-' + i, name: 'Loading…' } }
				isPlaceholder={ true }
			/>
		);
	} );
}

function TrailingItems() {
	const NUM_SPACERS = 11; // gives enough spacers for a theoretical 12 column layout
	return times( NUM_SPACERS, function ( i ) {
		return <div className="themes-list__spacer" key={ 'themes-list__spacer-' + i } />;
	} );
}

const mapStateToProps = ( state ) => ( {
	themesBookmark: getThemesBookmark( state ),
} );

export default connect( mapStateToProps )( localize( ThemesList ) );
