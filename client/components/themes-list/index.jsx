import { FEATURE_INSTALL_THEMES, PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	PatternAssemblerCta,
	usePatternAssemblerCtaData,
	isAssemblerSupported,
} from '@automattic/design-picker';
import { Icon, addTemplate, brush, cloudUpload } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import { useIsSiteAssemblerEnabledExp } from 'calypso/data/site-assembler';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { getWooMyCustomThemeOptions } from 'calypso/my-sites/themes/theme-options';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnECommerceTrial, isSiteOnWooExpress } from 'calypso/state/sites/plans/selectors';
import {
	getSiteThemeInstallUrl,
	getSiteAdminUrl,
	getSiteSlug,
	isWooCYSEligibleSite,
} from 'calypso/state/sites/selectors';
import { upsellCardDisplayed as upsellCardDisplayedAction } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { isDefaultWooExpressThemeActive } from 'calypso/state/themes/selectors/is-wooexpress-default-theme-active';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import WooDesignWithAIBanner from '../woo-design-with-ai-banner';
import {
	StartNewDesignWarningModal,
	StartOverWarningModal,
} from '../woo-design-with-ai-warning-modals';
import getSiteAssemblerUrl from './get-site-assembler-url';
import useWooActiveThemeQuery from './use-woo-active-theme-query';

import './style.scss';

const noop = () => {};
/* Used for second upsell nudge */
const getGridColumns = ( gridContainerRef, minColumnWidth, margin ) => {
	const container = gridContainerRef.current;
	if ( ! container ) {
		return null;
	}
	const containerWidth = container.offsetWidth;
	const availableWidth = containerWidth - margin;

	// Changing from desktop to mobile view can cause the container width to be smaller than the
	// minimum column width because it calculates before hiding the sidebar, which would result
	// in a division by zero. In that case, we just assume that there's only one column.
	const columnsPerRow = Math.floor( availableWidth / ( minColumnWidth + margin ) ) || 1;
	return columnsPerRow;
};

const getWarningModalComponent = ( isDefaultWooExpressTheme, isCurrentThemeAIGenerated ) => {
	switch ( true ) {
		case isCurrentThemeAIGenerated:
			return StartOverWarningModal;
		case ! isDefaultWooExpressTheme:
			return StartNewDesignWarningModal;
		default:
			return null;
	}
};

export const ThemesList = ( { tabFilter, ...props } ) => {
	const {
		themes,
		translate,
		isSiteWooExpressOrEcomFreeTrial,
		siteSlug,
		siteAdminUrl,
		getButtonOptions,
	} = props;
	const themesListRef = useRef( null );
	const [ showSecondUpsellNudge, setShowSecondUpsellNudge ] = useState( false );
	const isSiteAssemblerEnabled = useIsSiteAssemblerEnabledExp( 'theme-showcase' );
	const updateShowSecondUpsellNudge = useCallback( () => {
		const minColumnWidth = 320; // $theme-item-min-width: 320px;
		const margin = 32; // $theme-item-horizontal-margin: 32px;
		const columnsPerRow = getGridColumns( themesListRef, minColumnWidth, margin );
		const result = columnsPerRow && props.themes.length >= columnsPerRow * 6;
		setShowSecondUpsellNudge( result );
	}, [ props.themes.length ] );

	useEffect( () => {
		updateShowSecondUpsellNudge();
		window.addEventListener( 'resize', updateShowSecondUpsellNudge );
		return () => {
			window.removeEventListener( 'resize', updateShowSecondUpsellNudge );
		};
	}, [ updateShowSecondUpsellNudge ] );

	const selectedSite = useSelector( getSelectedSite );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const siteEditorUrl = useSelector( ( state ) =>
		getSiteEditorUrl( state, selectedSite?.ID, {
			canvas: 'edit',
			assembler: '1',
		} )
	);

	const fetchNextPage = useCallback(
		( options ) => {
			props.fetchNextPage( options );
		},
		[ props.fetchNextPage ]
	);

	const goToSiteAssemblerFlow = () => {
		const shouldGoToAssemblerStep = isAssemblerSupported();
		props.recordTracksEvent( 'calypso_themeshowcase_pattern_assembler_cta_click', {
			goes_to_assembler_step: shouldGoToAssemblerStep,
			is_logged_in: isLoggedIn,
		} );

		if ( props.onDesignYourOwnClick ) {
			props.onDesignYourOwnClick();
		} else {
			const destinationUrl = getSiteAssemblerUrl( {
				isLoggedIn,
				selectedSite,
				shouldGoToAssemblerStep,
				siteEditorUrl,
			} );
			window.location.assign( destinationUrl );
		}
	};

	const [ openWarningModal, setOpenWarningModal ] = useState( false );
	const { data: activeTheme } = useWooActiveThemeQuery(
		selectedSite?.ID,
		isSiteWooExpressOrEcomFreeTrial
	);

	const goToWooDesignWithAI = () => {
		props.recordTracksEvent( 'calypso_themeshowcase_woo_design_with_ai_cta_click', {
			is_ai_generated: activeTheme?.is_ai_generated,
		} );

		window.location.assign(
			`${ siteAdminUrl }admin.php?page=wc-admin&path=/customize-store/design-with-ai`
		);
	};

	const _themes = useMemo( () => {
		if ( ! activeTheme?.is_ai_generated ) {
			return themes;
		}

		const activeThemeIndex = themes.findIndex( ( theme ) => theme.id === activeTheme?.slug );
		if ( activeThemeIndex < 0 ) {
			return themes;
		}

		const theme = themes[ activeThemeIndex ];

		return [
			...themes.slice( 0, activeThemeIndex ),
			{
				...theme,
				isCustomGeneratedTheme: true,
				name: translate( 'My custom theme' ),
				buttonOptions: getWooMyCustomThemeOptions( {
					options: getButtonOptions( theme.id ),
					translate,
					siteAdminUrl,
					siteSlug,
				} ),
			},
			...themes.slice( activeThemeIndex + 1 ),
		];
	}, [ themes, translate, activeTheme, getButtonOptions, siteAdminUrl, siteSlug ] );

	if ( ! props.loading && props.themes.length === 0 ) {
		return (
			<Empty
				isFSEActive={ props.isFSEActive }
				recordTracksEvent={ props.recordTracksEvent }
				searchTerm={ props.searchTerm }
				translate={ props.translate }
				upsellCardDisplayed={ props.upsellCardDisplayed }
				isSiteAssemblerEnabled={ isSiteAssemblerEnabled }
			/>
		);
	}

	const SecondUpsellNudge = props.upsellBanner && (
		<div className="second-upsell-wrapper">
			{ React.cloneElement( props.upsellBanner, {
				event: `${ props.upsellBanner.props.event }_second_upsell_nudge`,
			} ) }
		</div>
	);

	const DesignWithAIWarningModal = getWarningModalComponent(
		props.isDefaultWooExpressThemeActive,
		activeTheme?.is_ai_generated
	);

	const onClickWooBannerCTA = () => {
		if ( props.isDefaultWooExpressThemeActive ) {
			goToWooDesignWithAI();
		} else {
			setOpenWarningModal( true );
		}
	};

	return (
		<div className="themes-list" ref={ themesListRef }>
			{ _themes.map( ( theme, index ) => (
				<ThemeBlock
					key={ 'theme-block' + index }
					theme={ theme }
					index={ index }
					tabFilter={ tabFilter }
					{ ...props }
				/>
			) ) }
			{ /* Don't show second upsell nudge when less than 6 rows are present.
				 Second plan upsell at 7th row is implemented through CSS. */ }
			{ showSecondUpsellNudge && SecondUpsellNudge }
			{ /* The Pattern Assembler CTA will display on the 9th row and the behavior is controlled by CSS */ }
			{ ! props.isWooCYSEligibleSite &&
				! ( props.isSiteWooExpressOrEcomFreeTrial && props.tier === 'free' ) &&
				tabFilter !== 'my-themes' &&
				_themes.length > 0 &&
				isSiteAssemblerEnabled && <PatternAssemblerCta onButtonClick={ goToSiteAssemblerFlow } /> }
			{ /* The Woo Design with AI banner will be displayed on the 2nd or last row.The behavior is controlled by CSS */ }
			{ props.isWooCYSEligibleSite && _themes.length > 0 && (
				<WooDesignWithAIBanner
					className={ activeTheme?.is_ai_generated ? 'last-row' : 'second-row' }
					onClick={ onClickWooBannerCTA }
				/>
			) }
			{ DesignWithAIWarningModal && openWarningModal && (
				<DesignWithAIWarningModal
					setOpenModal={ setOpenWarningModal }
					onContinue={ goToWooDesignWithAI }
					adminUrl={ siteAdminUrl }
				/>
			) }
			{ props.children }
			{ props.loading && <LoadingPlaceholders placeholderCount={ props.placeholderCount } /> }
			<InfiniteScroll nextPageMethod={ fetchNextPage } />
		</div>
	);
};

ThemesList.propTypes = {
	themes: PropTypes.array.isRequired,
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
	isLivePreviewStarted: PropTypes.func,
	// i18n function provided by localize()
	translate: PropTypes.func,
	placeholderCount: PropTypes.number,
	bookmarkRef: PropTypes.oneOfType( [
		PropTypes.func,
		PropTypes.shape( { current: PropTypes.any } ),
	] ),
	siteId: PropTypes.number,
	searchTerm: PropTypes.string,
	tier: PropTypes.string,
	upsellCardDisplayed: PropTypes.func,
	children: PropTypes.node,
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
	isLivePreviewStarted: () => false,
};

export function ThemeBlock( props ) {
	const { theme, index, tabFilter, tier } = props;
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState( null );

	if ( isEmpty( theme ) ) {
		return null;
	}

	// Decide if we should pass ref for bookmark.
	const { themesBookmark, siteId } = props;
	const bookmarkRef = themesBookmark === theme.id ? props.bookmarkRef : null;

	return (
		<Theme
			key={ `theme-${ theme.id }` }
			buttonContents={
				// Allow theme to override button options.
				theme.buttonOptions
					? theme.buttonOptions
					: props.getButtonOptions( theme.id, selectedStyleVariation )
			}
			screenshotClickUrl={ props.getScreenshotUrl?.( theme.id, {
				tabFilter,
				tierFilter: tier,
				styleVariationSlug: selectedStyleVariation?.slug,
			} ) }
			onScreenshotClick={ props.onScreenshotClick }
			onStyleVariationClick={ ( themeId, themeIndex, variation ) => {
				setSelectedStyleVariation( variation );
				props.onStyleVariationClick?.( themeId, themeIndex, variation );
			} }
			onMoreButtonClick={ props.onMoreButtonClick }
			onMoreButtonItemClick={ props.onMoreButtonItemClick }
			actionLabel={ props.getActionLabel( theme.id ) }
			index={ index }
			theme={ theme }
			active={ props.isActive( theme.id ) }
			loading={ props.isInstalling( theme.id ) || props.isLivePreviewStarted( theme.id ) }
			price={ props.getPrice( theme.id ) }
			upsellUrl={ props.upsellUrl }
			bookmarkRef={ bookmarkRef }
			siteId={ siteId }
			softLaunched={ theme.soft_launched }
			selectedStyleVariation={ selectedStyleVariation }
		/>
	);
}

function Options( {
	isFSEActive,
	recordTracksEvent,
	searchTerm,
	translate,
	upsellCardDisplayed,
	isSiteAssemblerEnabled,
} ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const selectedSite = useSelector( getSelectedSite );
	const canInstallTheme = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSite?.ID ) );
	const sitePlan = selectedSite?.plan?.product_slug;
	const siteEditorUrl = useSelector( ( state ) =>
		getSiteEditorUrl( state, selectedSite?.ID, {
			canvas: 'edit',
			assembler: '1',
		} )
	);
	const siteThemeInstallUrl = useSelector( ( state ) =>
		getSiteThemeInstallUrl( state, selectedSite?.ID )
	);
	const assemblerCtaData = usePatternAssemblerCtaData();
	const options = [];

	useEffect( () => {
		upsellCardDisplayed( true );
		return () => {
			upsellCardDisplayed( false );
		};
	}, [ upsellCardDisplayed ] );

	// Design your own theme / homepage.
	if ( ( isFSEActive || assemblerCtaData.shouldGoToAssemblerStep ) && isSiteAssemblerEnabled ) {
		options.push( {
			title: assemblerCtaData.title,
			icon: addTemplate,
			description: assemblerCtaData.subtitle,
			onClick: () =>
				recordTracksEvent( 'calypso_themeshowcase_more_options_design_homepage_click', {
					site_plan: sitePlan,
					search_term: searchTerm,
					destination: assemblerCtaData.shouldGoToAssemblerStep ? 'assembler' : 'site-editor',
				} ),
			url: getSiteAssemblerUrl( {
				isLoggedIn,
				selectedSite,
				shouldGoToAssemblerStep: assemblerCtaData.shouldGoToAssemblerStep,
				siteEditorUrl,
			} ),
			buttonText: assemblerCtaData.buttonText,
		} );
	} else {
		// This should also start the Pattern Assembler, which is currently in development for
		// the logged-out showcase on mobile viewport. Since there isn't any proper fallback for the meantime, we
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
			window.location.replace( 'https://wordpress.com/website-design-service/?ref=no-themes' );
		},
		url: 'https://wordpress.com/website-design-service/?ref=no-themes',
		buttonText: translate( 'Hire an expert' ),
	} );

	// Upload a theme.
	if ( ! isLoggedIn || ! selectedSite ) {
		options.push( {
			title: translate( 'Upload a theme' ),
			icon: cloudUpload,
			description: translate(
				'With a %(businessPlanName)s plan, you can upload and install third-party themes, including your own themes.',
				{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() } }
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
			url: isAtomic ? siteThemeInstallUrl : `/themes/upload/${ selectedSite.slug }`,
			buttonText: translate( 'Upload theme' ),
		} );
	} else {
		options.push( {
			title: translate( 'Upload a theme' ),
			icon: cloudUpload,
			description: translate(
				'With a %(businessPlanName)s plan, you can upload and install third-party themes, including your own themes.',
				{ args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() } }
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
				isSiteAssemblerEnabled={ props.isSiteAssemblerEnabled }
			/>
		</>
	);
}

function LoadingPlaceholders( { placeholderCount } ) {
	return times( placeholderCount, function ( i ) {
		return (
			<Theme
				key={ 'placeholder-' + i }
				theme={ { id: 'placeholder-' + i, name: 'Loading…' } }
				isPlaceholder
			/>
		);
	} );
}

const mapStateToProps = ( state, { siteId } ) => {
	return {
		themesBookmark: getThemesBookmark( state ),
		siteSlug: getSiteSlug( state, siteId ),
		isSiteWooExpressOrEcomFreeTrial:
			isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId ),
		isWooCYSEligibleSite: isWooCYSEligibleSite( state, siteId ),
		isDefaultWooExpressThemeActive: isDefaultWooExpressThemeActive( state, siteId ),
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
	};
};

const mapDispatchToProps = {
	upsellCardDisplayed: upsellCardDisplayedAction,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withIsFSEActive( ThemesList ) ) );
