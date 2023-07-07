import { useState } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { translate, TranslateResult } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import {
	GlobalStylesContext,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
} from '../../gutenberg-bridge';
import { useRegisterCoreBlocks } from '../../hooks';
import { isDefaultGlobalStylesVariationSlug } from '../../utils';
import GlobalStylesVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface GlobalStylesVariationProps {
	globalStylesVariation: GlobalStylesObject;
	isActive: boolean;
	showOnlyHoverView?: boolean;
	onSelect: () => void;
	showFreeBadge: boolean;
}

interface GlobalStylesVariationsProps {
	globalStylesVariations: GlobalStylesObject[];
	selectedGlobalStylesVariation: GlobalStylesObject | null;
	description?: TranslateResult;
	showOnlyHoverViewDefaultVariation?: boolean;
	splitDefaultVariation?: boolean;
	displayFreeLabel?: boolean;
	onSelect: ( globalStylesVariation: GlobalStylesObject ) => void;
	globalStylesInPersonalPlan: boolean;
}

const GlobalStylesVariation = ( {
	globalStylesVariation,
	isActive,
	showOnlyHoverView,
	showFreeBadge,
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
	}, [ globalStylesVariation, base ] );
	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			onSelect();
		}
	};
	return (
		<div
			className={ classnames( 'global-styles-variations__item', {
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
			{ showFreeBadge && (
				<div className="global-styles-variations__free-badge">
					<span>{ translate( 'Free' ) }</span>
				</div>
			) }
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
	onSelect,
	splitDefaultVariation = true,
	displayFreeLabel = true,
	globalStylesInPersonalPlan,
}: GlobalStylesVariationsProps ) => {
	const isRegisteredCoreBlocks = useRegisterCoreBlocks();
	const premiumStylesDescription = globalStylesInPersonalPlan
		? translate(
				'Unlock custom styles and tons of other features with the Personal plan, or try them out now for free.'
		  )
		: translate(
				'Unlock custom styles and tons of other features with the Premium plan, or try them out now for free.'
		  );

	const baseGlobalStyles = useMemo(
		() =>
			globalStylesVariations.find( ( globalStylesVariation ) =>
				isDefaultGlobalStylesVariationSlug( globalStylesVariation.slug )
			) ?? ( {} as GlobalStylesObject ),
		[ globalStylesVariations ]
	);
	const globalStylesVariationsWithoutDefault = useMemo(
		() =>
			globalStylesVariations.filter(
				( globalStylesVariation ) =>
					! isDefaultGlobalStylesVariationSlug( globalStylesVariation.slug )
			),
		[ globalStylesVariations ]
	);

	const nonDefaultStylesDescription = description ?? premiumStylesDescription;
	const nonDefaultStyles = globalStylesVariationsWithoutDefault.map(
		( globalStylesVariation, index ) => (
			<GlobalStylesVariation
				key={ index }
				showFreeBadge={ false }
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

	return (
		<GlobalStylesContext.Provider value={ { base: baseGlobalStyles } }>
			<div className="global-styles-variations__container">
				<div
					className={ classnames( 'global-styles-variations__type', {
						'combined-variations': ! splitDefaultVariation,
					} ) }
				>
					<div className="global-styles-variations__header">
						<h2>
							{ headerText }
							{ displayFreeLabel && (
								<div className="global-styles-variations__free-badge">
									<span>{ translate( 'Free' ) }</span>
								</div>
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
							showFreeBadge={ displayFreeLabel }
							globalStylesVariation={ baseGlobalStyles }
							isActive={
								! selectedGlobalStylesVariation ||
								isDefaultGlobalStylesVariationSlug( selectedGlobalStylesVariation?.slug )
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
								{ translate( 'Custom Style', 'Custom Styles', {
									count: nonDefaultStyles.length,
								} ) }
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
