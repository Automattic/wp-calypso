import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { upsellCardDisplayed as upsellCardDisplayedAction } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getSiteAssemblerUrl from './get-site-assembler-url';

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

export const ThemesList = ( { tabFilter, ...props } ) => {
	const themesListRef = useRef( null );
	const [ showSecondUpsellNudge, setShowSecondUpsellNudge ] = useState( false );
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
		} );

		const destinationUrl = getSiteAssemblerUrl( {
			isLoggedIn,
			selectedSite,
			shouldGoToAssemblerStep,
			siteEditorUrl,
		} );
		window.location.assign( destinationUrl );
	};

	if ( ! props.loading && props.themes.length === 0 ) {
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

	const SecondUpsellNudge = props.upsellBanner && (
		<div className="second-upsell-wrapper">
			{ React.cloneElement( props.upsellBanner, {
				event: `${ props.upsellBanner.props.event }_second_upsell_nudge`,
			} ) }
		</div>
	);

	return (
		<div className="themes-list" ref={ themesListRef }>
			{ props.themes.map( ( theme, index ) => (
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
			{ tabFilter !== 'my-themes' && props.themes.length > 0 && (
				<PatternAssemblerCta onButtonClick={ goToSiteAssemblerFlow } />
			) }
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
	recordTracksEvent: noop,
	fetchNextPage: noop,
	placeholderCount: DEFAULT_THEME_QUERY.number,
	optionsGenerator: () => [],
	getActionLabel: () => '',
	isActive: () => false,
	getPrice: () => '',
	isInstalling: () => false,
};

export function ThemeBlock( props ) {
	const { theme, index, tabFilter } = props;
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
			buttonContents={ props.getButtonOptions( theme.id, selectedStyleVariation ) }
			screenshotClickUrl={ props.getScreenshotUrl?.( theme.id, {
				tabFilter,
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
			price={ props.getPrice( theme.id ) }
			installing={ props.isInstalling( theme.id ) }
			upsellUrl={ props.upsellUrl }
			bookmarkRef={ bookmarkRef }
			siteId={ siteId }
			softLaunched={ theme.soft_launched }
			selectedStyleVariation={ selectedStyleVariation }
		/>
	);
}

function Options( { isFSEActive, recordTracksEvent, searchTerm, translate, upsellCardDisplayed } ) {
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
	const assemblerCtaData = usePatternAssemblerCtaData();

	const options = [];

	useEffect( () => {
		upsellCardDisplayed( true );
		return () => {
			upsellCardDisplayed( false );
		};
	}, [ upsellCardDisplayed ] );

	// Design your own theme / homepage.
	if ( isFSEActive || assemblerCtaData.shouldGoToAssemblerStep ) {
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
