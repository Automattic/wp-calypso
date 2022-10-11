import { FEATURE_INSTALL_THEMES, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import proThemesBanner from 'calypso/assets/images/themes/pro-themes-banner.svg';
import EmptyContent from 'calypso/components/empty-content';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const noop = () => {};

export const ThemesList = ( props ) => {
	const fetchNextPage = useCallback(
		( options ) => {
			props.fetchNextPage( options );
		},
		[ props.fetchNextPage ]
	);

	if ( ! props.loading && props.themes.length === 0 ) {
		return (
			<Empty
				emptyContent={ props.emptyContent }
				searchTerm={ props.searchTerm }
				translate={ props.translate }
				recordTracksEvent={ props.recordTracksEvent }
			/>
		);
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

function Empty( { emptyContent, searchTerm, translate, recordTracksEvent } ) {
	const selectedSite = useSelector( getSelectedSite );
	const shouldUpgradeToInstallThemes = useSelector(
		( state ) => ! siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);

	const onUpgradeClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_search_empty_results_upgrade_plan', {
			site_plan: selectedSite?.plan?.product_slug,
			search_term: searchTerm,
		} );

		return page(
			`/checkout/${ selectedSite.slug }/${ PLAN_BUSINESS }?redirect_to=/themes/${ selectedSite.slug }`
		);
	}, [ selectedSite, searchTerm ] );

	if ( emptyContent ) {
		return emptyContent;
	}

	return shouldUpgradeToInstallThemes ? (
		<div className="themes-list__empty-container">
			<div className="themes-list__not-found-text">
				{ translate( 'No themes match your search' ) }
			</div>

			<div className="themes-list__upgrade-section-wrapper">
				<div className="themes-list__upgrade-section-title">
					{ translate( 'Use any theme on WordPress.com' ) }
				</div>
				<div className="themes-list__upgrade-section-subtitle">
					{ translate(
						'Have a theme in mind that we don’t show here? Unlock the ability to use any theme, including Astra, with a Business plan.'
					) }
				</div>

				<Button primary className="themes-list__upgrade-section-cta" onClick={ onUpgradeClick }>
					{ translate( 'Upgrade your plan' ) }
				</Button>

				<div className="themes-list__themes-images">
					<img
						src={ proThemesBanner }
						alt={ translate(
							'Themes banner featuring Astra, Neve, GeneratePress, and Hestia theme'
						) }
					/>
				</div>
			</div>
		</div>
	) : (
		<EmptyContent
			title={ translate( 'Sorry, no themes found.' ) }
			line={ translate( 'Try a different search or more filters?' ) }
		/>
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
