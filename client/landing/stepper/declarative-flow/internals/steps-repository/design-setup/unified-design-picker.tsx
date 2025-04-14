import { WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED } from '@automattic/calypso-products';
import { Onboard, updateLaunchpadSettings, useStarterDesignsQuery } from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorization,
	useDesignPickerFilters,
} from '@automattic/design-picker';
import { useLocale, useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer, isSiteSetupFlow, Step } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useQuerySiteFeatures } from 'calypso/components/data/query-site-features';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import FormattedHeader from 'calypso/components/formatted-header';
import Loading from 'calypso/components/loading';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { useIsBigSkyEligible } from 'calypso/landing/stepper/hooks/use-is-site-big-sky-eligible';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useExperiment } from 'calypso/lib/explat';
import { useActivateDesign } from '../../../../hooks/use-activate-design';
import { useQuery } from '../../../../hooks/use-query';
import { useSiteData } from '../../../../hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import {
	getDesignEventProps,
	recordPreviewedDesign,
	recordSelectedDesign,
} from '../../analytics/record-design';
import { getCategorizationOptions } from './categories';
import { STEP_NAME } from './constants';
import useIsUpdatedBadgeDesign from './hooks/use-is-updated-badge-design';
import useRecipe from './hooks/use-recipe';
import useTrackFilters from './hooks/use-track-filters';
import UnifiedDesignPickerPreview from './unified-design-picker-preview';
import type { Step as StepType } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const EMPTY_ARRAY: Design[] = [];
const EMPTY_OBJECT = {};

const UnifiedDesignPickerStep: StepType< {
	submits: {
		selectedDesign?: Design;
		eventProps: {
			is_filter_included_with_plan_enabled: boolean;
			is_big_sky_eligible: boolean;
			preselected_filters: string;
			selected_filters: string;
		};
	};
} > = ( { navigation, flow, stepName } ) => {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_design_picker_image_optimization_202406'
	);
	const variantName = experimentAssignment?.variationName;
	const oldHighResImageLoading = ! isLoadingExperiment && variantName === 'treatment';

	const isUpdatedBadgeDesign = useIsUpdatedBadgeDesign();

	const { isEligible: isBigSkyEligible } = useIsBigSkyEligible();

	const queryParams = useQuery();
	const { goBack, submit, exitFlow } = navigation;

	const translate = useTranslate();
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();

	const { intent, goals } = useSelect( ( select ) => {
		const onboardStore = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			intent: onboardStore.getIntent(),
			goals: onboardStore.getGoals(),
		};
	}, [] );

	const { site, siteSlug, siteId, siteSlugOrId } = useSiteData();
	const { data: siteActiveTheme } = useActiveThemeQuery( site?.ID ?? 0, !! site?.ID );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const isComingFromTheUpgradeScreen = queryParams.get( 'continue' ) === '1';
	const isComingFromSuccessfulImport = queryParams.get( 'comingFromSuccessfulImport' ) === '1';

	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site &&
				( select( SITE_STORE ) as SiteSelect ).siteHasFeature(
					site.ID,
					WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED
				),
			[ site ]
		)
	);

	const activateDesign = useActivateDesign();

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			seed: siteSlugOrId ? String( siteSlugOrId ) : undefined,
			goals: goals.length > 0 ? goals : [ 'none' ],
			_locale: locale,
		},
		{
			enabled: true,
		}
	);

	const designs = allDesigns?.designs ?? EMPTY_ARRAY;
	const categorizationOptions = getCategorizationOptions( goals );

	const { commonFilterProperties, handleSelectFilter, handleDeselectFilter } = useTrackFilters( {
		preselectedFilters: categorizationOptions.defaultSelections,
		isBigSkyEligible,
	} );

	const categorization = useCategorization( allDesigns?.filters?.subject || EMPTY_OBJECT, {
		...categorizationOptions,
		handleSelect: handleSelectFilter,
		handleDeselect: handleDeselectFilter,
	} );

	const designPickerFilters = useDesignPickerFilters();

	// ********** Logic for selecting a design and style variation
	const {
		isPreviewingDesign,
		selectedDesign,
		selectedStyleVariation,
		selectedColorVariation,
		selectedFontVariation,
		numOfSelectedGlobalStyles,
		globalStyles,
		setSelectedDesign,
		previewDesign,
		previewDesignVariation,
		setSelectedColorVariation,
		setSelectedFontVariation,
		setGlobalStyles,
		resetPreview,
	} = useRecipe( allDesigns, pickUnlistedDesign, recordPreviewDesign, recordPreviewStyleVariation );

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const getEventPropsByDesign = useCallback(
		(
			design: Design,
			options: {
				styleVariation?: StyleVariation;
				colorVariation?: GlobalStylesObject | null;
				fontVariation?: GlobalStylesObject | null;
			} = {}
		) => {
			return {
				...getDesignEventProps( {
					...options,
					flow,
					intent,
					design,
				} ),
				categories: categorization.selections?.join( ',' ),
				...( design.recipe?.pattern_ids && {
					pattern_ids: design.recipe.pattern_ids.join( ',' ),
				} ),
				...( design.recipe?.header_pattern_ids && {
					header_pattern_ids: design.recipe.header_pattern_ids.join( ',' ),
				} ),
				...( design.recipe?.footer_pattern_ids && {
					footer_pattern_ids: design.recipe.footer_pattern_ids.join( ',' ),
				} ),
			};
		},
		[ flow, intent, categorization.selections ]
	);

	function recordPreviewDesign( design: Design, styleVariation?: StyleVariation ) {
		recordPreviewedDesign( { flow, intent, design, styleVariation } );
	}

	function recordPreviewStyleVariation( design: Design, styleVariation?: StyleVariation ) {
		recordTracksEvent(
			'calypso_signup_design_preview_style_variation_preview_click',
			getEventPropsByDesign( design, { styleVariation } )
		);
	}

	function trackAllDesignsView() {
		recordTracksEvent( 'calypso_signup_design_scrolled_to_end', {
			intent,
			categories: categorization?.selections?.join( ',' ),
		} );
	}

	useQueryThemes( 'wpcom', {
		number: 1000,
	} );

	/**
	 * Load data needed for the ThemeTierBadge.
	 *
	 * TODO: Move this within ThemeTierBadge as it's the consumer of the data.
	 * We will need to dedupe requests because right now each ThemeTierBadge
	 * instance will trigger a new request.
	 */
	useQueryProductsList();
	useQuerySiteFeatures( [ site?.ID ] );
	useQuerySitePurchases( site?.ID ?? -1 );

	const getBadge = ( themeId: string, isLockedStyleVariation: boolean ) => (
		<ThemeTierBadge
			canGoToCheckout={ false }
			isThemeList
			isLockedStyleVariation={ isLockedStyleVariation }
			siteId={ siteId }
			siteSlug={ siteSlug }
			themeId={ themeId }
		/>
	);

	const handleSubmit = useCallback(
		(
			providedDependencies?: { selectedDesign?: Design; selectedSiteCategory?: string },
			optionalProps?: object
		) => {
			const _selectedDesign = providedDependencies?.selectedDesign as Design;
			recordSelectedDesign( {
				...commonFilterProperties,
				flow,
				intent,
				design: _selectedDesign,
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
				optionalProps,
			} );

			submit?.( {
				...providedDependencies,
				eventProps: commonFilterProperties,
			} );
		},
		[
			commonFilterProperties,
			flow,
			intent,
			selectedStyleVariation,
			selectedColorVariation,
			selectedFontVariation,
			submit,
		]
	);

	const pickDesign = useCallback(
		async ( _selectedDesign: Design | undefined = selectedDesign ) => {
			setSelectedDesign( _selectedDesign );

			if ( siteSlugOrId ) {
				await updateLaunchpadSettings( siteSlugOrId, {
					checklist_statuses: { design_completed: true },
				} );
			}

			const optionalProps: { position_index?: number } = {};
			const positionIndex = designs.findIndex(
				( design ) => design.slug === _selectedDesign?.slug
			);

			if ( positionIndex >= 0 ) {
				optionalProps.position_index = positionIndex;
			}

			if ( siteSlugOrId && _selectedDesign ) {
				setPendingAction( async () => {
					await activateDesign( _selectedDesign, {
						styleVariation: selectedStyleVariation || _selectedDesign?.style_variations?.[ 0 ],
						globalStyles,
					} );
				} );

				handleSubmit(
					{
						selectedDesign: _selectedDesign,
					},
					optionalProps
				);
			}
		},
		[
			activateDesign,
			designs,
			globalStyles,
			handleSubmit,
			selectedDesign,
			selectedStyleVariation,
			setPendingAction,
			setSelectedDesign,
			siteSlugOrId,
		]
	);

	function pickUnlistedDesign( theme: string ) {
		// TODO: move this logic from this step to the flow(s). See: https://wp.me/pdDR7T-KR
		exitFlow?.( `/theme/${ theme }/${ siteSlug }` );
	}

	function handleBackClick() {
		designPickerFilters.resetFilters();
		goBack?.();
	}

	function recordStepContainerTracksEvent( eventName: string ) {
		recordTracksEvent( eventName, {
			step: 'design-setup',
			flow,
			intent,
		} );
	}

	const isUsingStepContainerV2 = shouldUseStepContainerV2( flow );

	useEffect( () => {
		if ( isComingFromTheUpgradeScreen ) {
			pickDesign();
		}
	}, [ isComingFromTheUpgradeScreen, pickDesign ] );

	// ********** Main render logic

	// Don't render until we've done fetching all the data needed for initial render.
	const isSiteLoading = ! site;
	const isDesignsLoading = isLoadingDesigns;
	const isLoading = isSiteLoading || isDesignsLoading;

	if ( isLoading || isComingFromTheUpgradeScreen ) {
		return isUsingStepContainerV2 ? <Step.Loading /> : <Loading />;
	}

	if ( selectedDesign && isPreviewingDesign ) {
		return (
			<UnifiedDesignPickerPreview
				selectedDesign={ selectedDesign }
				pickDesign={ pickDesign }
				getEventPropsByDesign={ getEventPropsByDesign }
				flow={ flow }
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
				stepName={ stepName }
				numOfSelectedGlobalStyles={ numOfSelectedGlobalStyles }
				previewDesignVariation={ previewDesignVariation }
				setSelectedColorVariation={ setSelectedColorVariation }
				setSelectedFontVariation={ setSelectedFontVariation }
				setGlobalStyles={ setGlobalStyles }
				resetPreview={ resetPreview }
				selectedStyleVariation={ selectedStyleVariation }
				selectedColorVariation={ selectedColorVariation }
				selectedFontVariation={ selectedFontVariation }
			/>
		);
	}

	const headerText = hasEnTranslation( 'Pick a theme' )
		? translate( 'Pick a theme' )
		: translate( 'Pick a design' );

	const subHeaderText = translate(
		'Choose a homepage design that works for you. You can always change it later.'
	);

	// Use this to prioritize themes in certain categories.
	// The specified theme will be shown first in the list.
	const priorityThemes: Record< string, string > = {
		education: 'course',
	};

	const stepContent = (
		<>
			<UnifiedDesignPicker
				designs={ designs }
				priorityThemes={ priorityThemes }
				locale={ locale }
				onPreview={ previewDesign }
				onViewAllDesigns={ trackAllDesignsView }
				heading={
					! isUsingStepContainerV2 ? (
						<FormattedHeader
							id="step-header"
							headerText={ headerText }
							subHeaderText={ subHeaderText }
						/>
					) : undefined
				}
				categorization={ categorization }
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
				// TODO: Update the ThemeCard component once the new design is rolled out completely
				// to avoid passing the getBadge and getOptionsMenu prop conditionally down the component tree.
				getBadge={ isUpdatedBadgeDesign ? undefined : getBadge }
				getOptionsMenu={ isUpdatedBadgeDesign ? getBadge : undefined }
				oldHighResImageLoading={ oldHighResImageLoading }
				siteActiveTheme={ siteActiveTheme?.[ 0 ]?.stylesheet ?? null }
				showActiveThemeBadge={
					intent !== SiteIntent.Build &&
					! isSiteSetupFlow( flow ) &&
					intent !== SiteIntent.UpdateDesign
				}
				isMultiFilterEnabled
				isBigSkyEligible={ isBigSkyEligible }
			/>
		</>
	);

	const getGoBackHandler = () => {
		if ( isComingFromSuccessfulImport ) {
			return undefined;
		}
		return intent === 'update-design'
			? () =>
					submit?.( {
						eventProps: commonFilterProperties,
					} )
			: () => handleBackClick();
	};

	const backButton = getGoBackHandler();
	const hideSkip = ! isComingFromSuccessfulImport;
	const skipLabelText = isComingFromSuccessfulImport
		? translate( 'Skip to dashboard' )
		: translate( 'Skip setup' );

	if ( isUsingStepContainerV2 ) {
		return (
			<Step.WideLayout
				className="step-container-v2--design-picker"
				topBar={
					<Step.TopBar
						leftElement={ backButton ? <Step.BackButton onClick={ backButton } /> : undefined }
						rightElement={
							hideSkip ? undefined : (
								<Step.SkipButton onClick={ () => handleSubmit() }>
									{ skipLabelText }
								</Step.SkipButton>
							)
						}
					/>
				}
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			>
				{ stepContent }
			</Step.WideLayout>
		);
	}

	return (
		<StepContainer
			stepName={ STEP_NAME }
			className="unified-design-picker__has-categories"
			skipButtonAlign="top"
			hideFormattedHeader
			hideSkip={ hideSkip }
			skipLabelText={ skipLabelText }
			backLabelText={ translate( 'Back' ) }
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ handleSubmit }
			goBack={ backButton }
		/>
	);
};

export default UnifiedDesignPickerStep;
