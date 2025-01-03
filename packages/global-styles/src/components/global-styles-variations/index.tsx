import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM, getPlan, PLAN_PERSONAL } from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useState } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import clsx from 'clsx';
import { translate, TranslateResult } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import {
	GlobalStylesContext,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
	isDefaultVariation,
} from '../../gutenberg-bridge';
import { useRegisterCoreBlocks } from '../../hooks';
import { getGroupedVariations } from '../../utils';
import GlobalStylesVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface GlobalStylesVariationProps {
	globalStylesVariation: GlobalStylesObject;
	isActive: boolean;
	showOnlyHoverView?: boolean;
	onSelect: () => void;
}

interface GlobalStylesVariationsProps {
	globalStylesVariations: GlobalStylesObject[];
	selectedGlobalStylesVariation: GlobalStylesObject | null;
	description?: TranslateResult;
	showOnlyHoverViewDefaultVariation?: boolean;
	splitDefaultVariation?: boolean;
	needsUpgrade?: boolean;
	onSelect: ( globalStylesVariation: GlobalStylesObject ) => void;
}

const GlobalStylesVariation = ( {
	globalStylesVariation,
	isActive,
	showOnlyHoverView,
	onSelect,
}: GlobalStylesVariationProps ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		const { inline_css: globalStylesVariationInlineCss = '' } = globalStylesVariation;
		const baseInlineCss = base.inline_css || '';
		return {
			user: globalStylesVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, globalStylesVariation ),
			inline_css: baseInlineCss + globalStylesVariationInlineCss,
		};
	}, [ globalStylesVariation.slug, base ] );
	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			onSelect();
		}
	};
	return (
		<div
			className={ clsx( 'global-styles-variations__item', {
				'is-active': isActive,
			} ) }
			role="button"
			onBlur={ () => setIsFocused( false ) }
			onFocus={ () => setIsFocused( true ) }
			onClick={ onSelect }
			onKeyDown={ selectOnEnter }
			tabIndex={ 0 }
			aria-current={ isActive }
			aria-label={
				translate( 'Style: %s', {
					comment: 'Aria label for style preview buttons',
					args: globalStylesVariation.title,
				} ) as string
			}
		>
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<GlobalStylesVariationPreview
						title={ globalStylesVariation.title }
						inlineCss={ context.inline_css }
						isFocused={ isFocused || showOnlyHoverView }
						onFocusOut={ () => setIsFocused( false ) }
					/>
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

const GlobalStylesVariations = ( {
	globalStylesVariations,
	selectedGlobalStylesVariation,
	description,
	showOnlyHoverViewDefaultVariation,
	splitDefaultVariation = true,
	needsUpgrade = true,
	onSelect,
}: GlobalStylesVariationsProps ) => {
	const hasEnTranslation = useHasEnTranslation();
	const isRegisteredCoreBlocks = useRegisterCoreBlocks();
	const upgradeToPlan = isEnabled( 'global-styles/on-personal-plan' )
		? PLAN_PERSONAL
		: PLAN_PREMIUM;

	const variationDescription = needsUpgrade
		? translate(
				'Unlock style variations and tons of other features with the %(planName)s plan, or try them out now for free.',
				{ args: { planName: getPlan( upgradeToPlan )?.getTitle() ?? '' } }
		  )
		: translate( 'You can change your style at any time.' );

	const baseGlobalStyles = useMemo(
		() =>
			globalStylesVariations.find( ( globalStylesVariation ) =>
				isDefaultVariation( globalStylesVariation )
			) ?? ( {} as GlobalStylesObject ),
		[ globalStylesVariations ]
	);

	const { styleVariations, colorVariations } = useMemo(
		() => getGroupedVariations( globalStylesVariations ),
		[ globalStylesVariations ]
	);

	// Use the color variations if the style variations are empty because we don't display color variations as palette section.
	const globalStylesVariationsWithoutDefault =
		styleVariations.length > 0 ? styleVariations : colorVariations;

	const nonDefaultStylesDescription = description ?? variationDescription;
	const nonDefaultStyles = globalStylesVariationsWithoutDefault.map(
		( globalStylesVariation, index ) => (
			<GlobalStylesVariation
				key={ index }
				globalStylesVariation={ globalStylesVariation }
				isActive={ globalStylesVariation.slug === selectedGlobalStylesVariation?.slug }
				onSelect={ () => onSelect( globalStylesVariation ) }
			/>
		)
	);

	const headerText = splitDefaultVariation ? translate( 'Default Style' ) : translate( 'Styles' );

	if ( ! isRegisteredCoreBlocks ) {
		return null;
	}

	if ( globalStylesVariationsWithoutDefault.length === 0 ) {
		return null;
	}

	return (
		<GlobalStylesContext.Provider value={ { base: baseGlobalStyles } }>
			<div className="global-styles-variations__container">
				<div
					className={ clsx( 'global-styles-variations__type', {
						'combined-variations': ! splitDefaultVariation,
					} ) }
				>
					<div className="global-styles-variations__header">
						<h2>
							<span>{ headerText }</span>
							{ ! splitDefaultVariation && ! needsUpgrade && (
								<PremiumBadge
									shouldHideTooltip
									shouldCompactWithAnimation
									labelText={ translate( 'Included in your plan' ) }
								/>
							) }
						</h2>
						{ ! splitDefaultVariation && (
							<div>
								<p>{ translate( 'You can change your style at any time.' ) }</p>
							</div>
						) }
					</div>
					<div className="global-styles-variations">
						<GlobalStylesVariation
							key="base"
							globalStylesVariation={ baseGlobalStyles }
							isActive={
								! selectedGlobalStylesVariation ||
								isDefaultVariation( selectedGlobalStylesVariation )
							}
							showOnlyHoverView={ showOnlyHoverViewDefaultVariation }
							onSelect={ () => onSelect( baseGlobalStyles ) }
						/>
						{ ! splitDefaultVariation && nonDefaultStyles }
					</div>
				</div>
				{ splitDefaultVariation && (
					<div className="global-styles-variations__type">
						<div className="global-styles-variations__header">
							<h2>
								<span>
									{ hasEnTranslation( 'Style Variations' )
										? translate( 'Style Variation', 'Style Variations', {
												count: nonDefaultStyles.length,
										  } )
										: translate( 'Premium Style', 'Premium Styles', {
												count: nonDefaultStyles.length,
										  } ) }
								</span>
								{ needsUpgrade && (
									<PremiumBadge
										shouldHideTooltip
										shouldCompactWithAnimation
										labelText={ translate( 'Upgrade' ) }
									/>
								) }
							</h2>
							<p>{ nonDefaultStylesDescription }</p>
						</div>
						<div className="global-styles-variations">{ nonDefaultStyles }</div>
					</div>
				) }
			</div>
		</GlobalStylesContext.Provider>
	);
};

export default withExperimentalBlockEditorProvider( GlobalStylesVariations );
