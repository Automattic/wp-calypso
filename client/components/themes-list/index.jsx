import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { PatternAssemblerCta, BLANK_CANVAS_DESIGN } from '@automattic/design-picker';
import { WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { Icon, addTemplate, brush, cloudUpload } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { upsellCardDisplayed as upsellCardDisplayedAction } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const noop = () => {};

export const ThemesList = ( props ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const isPatternAssemblerCTAEnabled =
		isEnabled( 'pattern-assembler/logged-out-showcase' ) && ! isLoggedIn;

	const fetchNextPage = useCallback(
		( options ) => {
			props.fetchNextPage( options );
		},
		[ props.fetchNextPage ]
	);

	const goToSiteAssemblerFlow = ( shouldGoToAssemblerStep ) => {
		props.recordTracksEvent( 'calypso_themeshowcase_pattern_assembler_cta_click', {
			goes_to_assembler_step: shouldGoToAssemblerStep,
		} );

		const params = new URLSearchParams( {
			ref: 'calypshowcase',
			theme: BLANK_CANVAS_DESIGN.slug,
		} );
		window.location.assign( `/start/${ WITH_THEME_ASSEMBLER_FLOW }?${ params }` );
	};

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
			return (
				<>
					<WPOrgMatchingThemes matchingThemes={ matchingWpOrgThemes } { ...props } />
					{ isPatternAssemblerCTAEnabled && (
						<PatternAssemblerCta onButtonClick={ goToSiteAssemblerFlow } />
					) }
				</>
			);
		}

		return (
			<Empty
				isFSEActive={ props.isFSEActive }
				recordTracksEvent={ props.recordTracksEvent }
				searchTerm={ props.searchTerm }
				translate={ props.translate }
				upsellCardDisplayed={ props.upsellCardDisplayed }
			/>
		);
	}

	return (
		<div className="themes-list">
			{ props.themes.map( ( theme, index ) => (
				<ThemeBlock key={ 'theme-block' + index } theme={ theme } index={ index } { ...props } />
			) ) }
			{ /* The Pattern Assembler CTA will display on the 9th row and the behavior is controlled by CSS */ }
			{ isPatternAssemblerCTAEnabled && props.themes.length > 0 && (
				<PatternAssemblerCta onButtonClick={ goToSiteAssemblerFlow } />
			) }
			{ props.loading && <LoadingPlaceholders placeholderCount={ props.placeholderCount } /> }
			<InfiniteScroll nextPageMethod={ fetchNextPage } />
		</div>
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

function Options( { isFSEActive, recordTracksEvent, searchTerm, translate, upsellCardDisplayed } ) {
	const isLoggedInShowcase = useSelector( isUserLoggedIn );
	const selectedSite = useSelector( getSelectedSite );
	const canInstallTheme = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSite?.ID ) );
	const sitePlan = selectedSite?.plan?.product_slug;

	const options = [];

	useEffect( () => {
		upsellCardDisplayed( true );
		return () => {
			upsellCardDisplayed( false );
		};
	}, [ upsellCardDisplayed ] );

	// Design your own theme / homepage.
	if ( isLoggedInShowcase ) {
		// This should start the Pattern Assembler ideally, but it's not ready yet for the
		// logged-in showcase, so we use the site editor as a fallback.
		if ( isFSEActive ) {
			options.push( {
				title: translate( 'Design your own' ),
				icon: addTemplate,
				description: translate( 'Jump right into the editor to design your homepage.' ),
				onClick: () =>
					recordTracksEvent( 'calypso_themeshowcase_more_options_design_homepage_click', {
						site_plan: sitePlan,
						search_term: searchTerm,
						destination: 'site-editor',
					} ),
				url: `/site-editor/${ selectedSite.slug }`,
				buttonText: translate( 'Open the editor' ),
			} );
		}
	} else {
		// This should also start the Pattern Assembler, which is currently in development for
		// the logged-out showcase. Since there isn't any proper fallback for the meantime, we
		// just don't include this option.
	}

	// Do it for me.
	options.push( {
		title: translate( 'Hire our team of experts to design one for you', {
			comment:
				'"One" could mean "theme" or "site" in this context (i.e. "Hire our team of experts to design a theme for you")',
		} ),
		icon: brush,
		description: translate(
			'A WordPress.com professional will create layouts for up to 5 pages of your site.'
		),
		onClick: () => {
			recordTracksEvent( 'calypso_themeshowcase_more_options_difm_click', {
				site_plan: sitePlan,
				search_term: searchTerm,
			} );
			window.location.replace( 'https://wordpress.com/do-it-for-me/' );
		},
		url: 'https://wordpress.com/do-it-for-me/',
		buttonText: translate( 'Hire an expert' ),
	} );

	// Upload a theme.
	if ( ! isLoggedInShowcase ) {
		options.push( {
			title: translate( 'Upload a theme' ),
			icon: cloudUpload,
			description: translate(
				'With a Business plan, you can upload and install third-party themes, including your own themes.'
			),
			onClick: () =>
				recordTracksEvent( 'calypso_themeshowcase_more_options_upload_theme_click', {
					site_plan: sitePlan,
					search_term: searchTerm,
					destination: 'signup',
				} ),
			url: '/start/business',
			buttonText: translate( 'Get started' ),
		} );
	} else if ( canInstallTheme ) {
		options.push( {
			title: translate( 'Upload a theme' ),
			icon: cloudUpload,
			description: translate(
				'You can upload and install third-party themes, including your own themes.'
			),
			onClick: () =>
				recordTracksEvent( 'calypso_themeshowcase_more_options_upload_theme_click', {
					site_plan: sitePlan,
					search_term: searchTerm,
					destination: 'upload-theme',
				} ),
			url: isAtomic
				? `https://${ selectedSite.slug }/wp-admin/theme-install.php`
				: `/themes/upload/${ selectedSite.slug }`,
			buttonText: translate( 'Upload theme' ),
		} );
	} else {
		options.push( {
			title: translate( 'Upload a theme' ),
			icon: cloudUpload,
			description: translate(
				'With a Business plan, you can upload and install third-party themes, including your own themes.'
			),
			onClick: () =>
				recordTracksEvent( 'calypso_themeshowcase_more_options_upload_theme_click', {
					site_plan: sitePlan,
					search_term: searchTerm,
					destination: 'checkout',
				} ),
			url: `/checkout/${ selectedSite.slug }/business?redirect_to=/themes/upload/${ selectedSite.slug }`,
			buttonText: translate( 'Upgrade your plan' ),
		} );
	}

	return (
		<div className="themes-list__options">
			<div className="themes-list__options-heading">
				{ translate( "Can't find what you're looking for?" ) }
			</div>
			<div className="themes-list__options-subheading">
				{ translate( 'Here are a few more options:' ) }
			</div>
			{ options.map( ( option, index ) => (
				<div className="themes-list__option" key={ index }>
					<Icon className="themes-list__option-icon" icon={ option.icon } size={ 28 } />
					<div className="themes-list__option-content">
						<div className="themes-list__option-text">
							<div className="themes-list__option-title">{ option.title }</div>
							<div className="themes-list__option-description">{ option.description }</div>
						</div>
						<Button
							primary={ index === 0 }
							className="themes-list__option-button"
							href={ option.url }
							onClick={ option.onClick }
						>
							{ option.buttonText }
						</Button>
					</div>
				</div>
			) ) }
		</div>
	);
}

function Empty( props ) {
	return (
		<>
			<div className="themes-list__empty-search-text">
				{ props.translate( 'No themes match your search' ) }
			</div>
			<Options
				isFSEActive={ props.isFSEActive }
				recordTracksEvent={ props.recordTracksEvent }
				searchTerm={ props.searchTerm }
				translate={ props.translate }
				upsellCardDisplayed={ props.upsellCardDisplayed }
			/>
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

const mapStateToProps = ( state ) => ( {
	themesBookmark: getThemesBookmark( state ),
} );

const mapDispatchToProps = {
	upsellCardDisplayed: upsellCardDisplayedAction,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withIsFSEActive( ThemesList ) ) );
