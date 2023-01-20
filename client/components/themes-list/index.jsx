import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useViewportMatch } from '@wordpress/compose';
import { Icon, addTemplate, brush, cloudUpload } from '@wordpress/icons';
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

	const matchingWpOrgThemes = useMemo(
		() =>
			props.wpOrgThemes?.filter(
				( wpOrgTheme ) =>
					wpOrgTheme?.name?.toLowerCase() === props.searchTerm.toLowerCase() ||
					wpOrgTheme?.id?.toLowerCase() === props.searchTerm.toLowerCase()
			) || [],
		[ props.wpOrgThemes, props.searchTerm ]
	);

	if ( ! props.loading && props.themes.length === 0 ) {
		if ( matchingWpOrgThemes.length ) {
			return <WPOrgMatchingThemes matchingThemes={ matchingWpOrgThemes } { ...props } />;
		}

		return (
			<Empty translate={ props.translate } upsellCardDisplayed={ props.upsellCardDisplayed } />
		);
	}

	return (
		<>
			<div className="themes-list">
				{ props.themes.map( ( theme, index ) => (
					<ThemeBlock key={ 'theme-block' + index } theme={ theme } index={ index } { ...props } />
				) ) }
				{ props.loading && <LoadingPlaceholders placeholderCount={ props.placeholderCount } /> }
				{ /* Invisible trailing items keep all elements same width in flexbox grid. */ }
				<TrailingItems />
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</div>
			<Footer translate={ props.translate } upsellCardDisplayed={ props.upsellCardDisplayed } />
		</>
	);
};

ThemesList.propTypes = {
	themes: PropTypes.array.isRequired,
	wpOrgThemes: PropTypes.array,
	loading: PropTypes.bool.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	fetchNextPage: PropTypes.func.isRequired,
	getButtonOptions: PropTypes.func,
	getScreenshotUrl: PropTypes.func,
	onScreenshotClick: PropTypes.func.isRequired,
	onStyleVariationClick: PropTypes.func,
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

function Footer( props ) {
	const { upsellCardDisplayed, translate } = props;
	const selectedSite = useSelector( getSelectedSite );
	const canInstallTheme = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);
	const canGoToPatternAssembler = useViewportMatch( 'large' );

	// Prevents the Upwork upsell from being visible, so it doesn't conflict with the actions below.
	useEffect( () => {
		if ( selectedSite ) {
			upsellCardDisplayed( true );
		} else {
			upsellCardDisplayed( false );
		}
		return () => {
			upsellCardDisplayed( false );
		};
	}, [ selectedSite, upsellCardDisplayed ] );

	if ( ! selectedSite ) {
		return null;
	}

	return (
		<div className="themes-list__footer">
			<div className="themes-list__footer-heading">
				{ translate( "Can't find what you're looking for?" ) }
			</div>
			<div className="themes-list__footer-subheading">
				{ translate( 'Here are a few more options' ) }
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ addTemplate } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Create your own theme from scratch' ) }
						</div>
						<div className="themes-list__footer-action-description">
							{ canGoToPatternAssembler
								? translate(
										'Start with a blank canvas and design your own homepage using our library of patterns.'
								  )
								: translate( 'Jump right into the editor to design your homepage from scratch.' ) }
						</div>
					</div>
					<Button
						primary
						className="themes-list__footer-action-button"
						href={
							canGoToPatternAssembler
								? `/setup/site-setup/patternAssembler?siteSlug=${ selectedSite.slug }&backTo=/themes/${ selectedSite.slug }`
								: `/site-editor/${ selectedSite.slug }`
						}
					>
						{ canGoToPatternAssembler
							? translate( 'Start designing' )
							: translate( 'Open the editor' ) }
					</Button>
				</div>
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ brush } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Hire our team of experts to design one for you' ) }
						</div>
						<div className="themes-list__footer-action-description">
							{ translate(
								'A WordPress.com professional will create layouts for up to 5 pages of your site.'
							) }
						</div>
					</div>
					<Button
						className="themes-list__footer-action-button"
						href="https://wordpress.com/do-it-for-me/"
					>
						{ translate( 'Hire an expert' ) }
					</Button>
				</div>
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ cloudUpload } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Upload your theme' ) }
						</div>
						<div className="themes-list__footer-action-description">
							{ canInstallTheme
								? translate(
										'You can upload third-party themes to your site, including themes from WordPress.org, and even themes you have custom-made for your website.'
								  )
								: translate(
										'Upgrade your plan to unlock the ability to upload and install your own theme.'
								  ) }
						</div>
					</div>
					<Button
						className="themes-list__footer-action-button"
						href={
							canInstallTheme
								? `https://${ selectedSite.slug }/wp-admin/theme-install.php`
								: `/themes/upload/${ selectedSite.slug }`
						}
					>
						{ translate( 'Upload theme' ) }
					</Button>
				</div>
			</div>
		</div>
	);
}

function Empty( props ) {
	const { translate, upsellCardDisplayed, searchTerm } = props;
	const selectedSite = useSelector( getSelectedSite );

	if ( ! selectedSite ) {
		return (
			<>
				<EmptyContent
					title={ translate( 'Sorry, no themes found.' ) }
					line={ translate( 'Try a different search or more filters?' ) }
				/>
				<PlanGetStartedCTA
					searchTerm={ searchTerm }
					translate={ translate }
					recordTracksEvent={ props.recordTracksEvent }
				/>
			</>
		);
	}

	return (
		<>
			<div className="themes-list__empty-search-text">
				{ translate( 'No themes match your search' ) }
			</div>
			<Footer translate={ translate } upsellCardDisplayed={ upsellCardDisplayed } />
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
		<div>
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
			<Footer translate={ props.translate } upsellCardDisplayed={ props.upsellCardDisplayed } />
		</div>
	);
}

function PlanGetStartedCTA( { searchTerm, translate, recordTracksEvent } ) {
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

			<Button primary className="themes-list__upgrade-section-cta" onClick={ onGetStartedClick }>
				{ translate( 'Get started' ) }
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
