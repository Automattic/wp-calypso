import { FEATURE_INSTALL_THEMES, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import proThemesBanner from 'calypso/assets/images/themes/pro-themes-banner.svg';
import EmptyContent from 'calypso/components/empty-content';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { upsellCardDisplayed as upsellCardDisplayedAction } from 'calypso/state/themes/actions';
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
				upsellCardDisplayed={ props.upsellCardDisplayed }
				wpOrgThemes={ props.wpOrgThemes }
				{ ...props }
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
	wpOrgThemes: PropTypes.array,
	emptyContent: PropTypes.element,
	loading: PropTypes.bool.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	fetchNextPage: PropTypes.func.isRequired,
	getButtonOptions: PropTypes.func,
	getScreenshotUrl: PropTypes.func,
	onScreenshotClick: PropTypes.func.isRequired,
	onStyleVariationClick: PropTypes.func,
	onMoreButtonClick: PropTypes.func,
	onMoreButtonItemClick: PropTypes.func,
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
	upsellCardDisplayed: PropTypes.func,
};

ThemesList.defaultProps = {
	loading: false,
	searchTerm: '',
	themes: [],
	wpOrgThemes: [],
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
			onStyleVariationClick={ props.onStyleVariationClick }
			onMoreButtonClick={ props.onMoreButtonClick }
			onMoreButtonItemClick={ props.onMoreButtonItemClick }
			actionLabel={ props.getActionLabel( theme.id ) }
			index={ index }
			theme={ theme }
			active={ props.isActive( theme.id ) }
			price={ props.getPrice( theme.id ) }
			installing={ props.isInstalling( theme.id ) }
			upsellUrl={ props.upsellUrl }
			bookmarkRef={ bookmarkRef }
			siteId={ siteId }
			softLaunched={ theme.soft_launched }
		/>
	);
}

function Empty( props ) {
	const { wpOrgThemes, emptyContent, searchTerm, upsellCardDisplayed, translate } = props;
	const selectedSite = useSelector( getSelectedSite );
	const shouldUpgradeToInstallThemes = useSelector(
		( state ) => ! siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);

	const matchingThemes = useMemo(
		() =>
			wpOrgThemes?.filter(
				( wpOrgTheme ) =>
					wpOrgTheme?.name?.toLowerCase() === searchTerm.toLowerCase() ||
					wpOrgTheme?.id?.toLowerCase() === searchTerm.toLowerCase()
			) || [],
		[ wpOrgThemes, searchTerm ]
	);

	useEffect( () => {
		if ( shouldUpgradeToInstallThemes && ! emptyContent ) {
			upsellCardDisplayed( true );
		} else {
			upsellCardDisplayed( false );
		}
		return () => {
			upsellCardDisplayed( false );
		};
	}, [ emptyContent, shouldUpgradeToInstallThemes, upsellCardDisplayed ] );

	if ( emptyContent ) {
		return emptyContent;
	}

	return shouldUpgradeToInstallThemes ? (
		<div className="themes-list__empty-container">
			{ matchingThemes.length ? (
				<WPOrgMatchingThemes
					matchingThemes={ matchingThemes }
					selectedSite={ selectedSite }
					{ ...props }
				/>
			) : (
				<>
					<div className="themes-list__not-found-text">
						{ translate( 'No themes match your search' ) }
					</div>
					<PlanUpgradeCTA
						selectedSite={ selectedSite }
						searchTerm={ searchTerm }
						translate={ translate }
						recordTracksEvent={ props.recordTracksEvent }
					/>
				</>
			) }
		</div>
	) : (
		<>
			{ matchingThemes.length ? (
				<WPOrgMatchingThemes matchingThemes={ matchingThemes } { ...props } />
			) : (
				<EmptyContent
					title={ translate( 'Sorry, no themes found.' ) }
					line={ translate( 'Try a different search or more filters?' ) }
				/>
			) }
		</>
	);
}

function WPOrgMatchingThemes( props ) {
	const { matchingThemes } = props;

	const onWPOrgCardClick = useCallback(
		( theme ) => {
			props.recordTracksEvent( 'calypso_themeshowcase_search_empty_wp_org_card_click', {
				site_plan: props.selectedSite?.plan?.product_slug,
				theme_id: theme?.id,
			} );
		},
		[ props.recordTracksEvent, props.selectedSite ]
	);

	return (
		<div className="themes-list">
			{ matchingThemes.map( ( theme, index ) => (
				<div
					onClick={ () => onWPOrgCardClick( theme ) }
					key={ 'theme-block' + index }
					role="button"
					tabIndex={ 0 }
					onKeyUp={ () => onWPOrgCardClick( theme ) }
				>
					<ThemeBlock theme={ theme } index={ index } { ...props } />
				</div>
			) ) }
			<TrailingItems />
		</div>
	);
}

function PlanUpgradeCTA( { selectedSite, searchTerm, translate, recordTracksEvent } ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const onUpgradeClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_search_empty_results_upgrade_plan', {
			site_plan: selectedSite?.plan?.product_slug,
			search_term: searchTerm,
		} );

		if ( ! selectedSite?.slug ) {
			return page( `/checkout/${ PLAN_BUSINESS }?redirect_to=/themes` );
		}

		return page(
			`/checkout/${ selectedSite.slug }/${ PLAN_BUSINESS }?redirect_to=/themes/${ selectedSite.slug }`
		);
	}, [ selectedSite, searchTerm, recordTracksEvent ] );

	const onGetStartedClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_search_empty_results_get_started', {
			search_term: searchTerm,
		} );

		return page( `/start/business` );
	}, [ searchTerm, recordTracksEvent ] );

	return (
		<div className="themes-list__upgrade-section-wrapper">
			<div className="themes-list__upgrade-section-title">
				{ translate( 'Use any theme on WordPress.com' ) }
			</div>
			<div className="themes-list__upgrade-section-subtitle">
				{ translate(
					'Have a theme in mind that we don’t show here? Unlock the ability to use any theme, including Astra, with a Business plan.'
				) }
			</div>

			{ isLoggedIn ? (
				<Button primary className="themes-list__upgrade-section-cta" onClick={ onUpgradeClick }>
					{ translate( 'Upgrade your plan' ) }
				</Button>
			) : (
				<Button primary className="themes-list__upgrade-section-cta" onClick={ onGetStartedClick }>
					{ translate( 'Get started' ) }
				</Button>
			) }

			<div className="themes-list__themes-images">
				<img
					src={ proThemesBanner }
					alt={ translate(
						'Themes banner featuring Astra, Neve, GeneratePress, and Hestia theme'
					) }
				/>
			</div>
		</div>
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

const mapDispatchToProps = {
	upsellCardDisplayed: upsellCardDisplayedAction,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ThemesList ) );
