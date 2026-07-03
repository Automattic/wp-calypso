import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { SpaceFeedLayout, SpaceLayoutWidth } from '@automattic/api-core';

type TranslateFn = ReturnType< typeof useTranslate >;

/**
 * Column width a space's feed defaults to when none is stored — `wide` keeps the
 * roomy layout that every space rendered with before the width choice shipped.
 */
export const DEFAULT_SPACE_WIDTH: SpaceLayoutWidth = 'wide';

interface Props {
	value: SpaceFeedLayout;
	onChange: ( view: SpaceFeedLayout ) => void;
	width: SpaceLayoutWidth;
	onWidthChange: ( width: SpaceLayoutWidth ) => void;
}

/**
 * Title for a feed-layout preset, shared by the picker cards and the modal
 * footer summary.
 */
export function getLayoutPresetTitle( view: SpaceFeedLayout, translate: TranslateFn ): string {
	switch ( view ) {
		case 'standard-list':
			return translate( 'Compact list' ) as string;
		case 'gallery':
			return translate( 'Media gallery' ) as string;
		case 'board':
			return translate( 'Airy board' ) as string;
		case 'legacy':
		default:
			return translate( 'Classic' ) as string;
	}
}

/**
 * The feed-layout presets. `legacy` uses the existing classic Reader stream
 * layout and is offered alongside the newer curated layouts.
 */
export function LayoutTab( { value, onChange, width, onWidthChange }: Props ) {
	const translate = useTranslate();

	const presets: { id: SpaceFeedLayout; description: string; beta?: boolean }[] = [
		{ id: 'legacy', description: translate( 'Classic Reader stream' ) },
		{ id: 'standard-list', description: translate( 'Many items, fast scanning' ), beta: true },
		{ id: 'gallery', description: translate( 'Grid of cards with thumbnails' ), beta: true },
		{ id: 'board', description: translate( 'Big roomy cards, casual scroll' ), beta: true },
	];

	const widths: { id: SpaceLayoutWidth; title: string; description: string }[] = [
		{
			id: 'regular',
			title: translate( 'Regular' ),
			description: translate( 'Narrower, single reading column' ),
		},
		{
			id: 'wide',
			title: translate( 'Wide' ),
			description: translate( 'Full-width, roomy layout' ),
		},
	];

	return (
		<VStack spacing={ 4 }>
			<p className="customize-space-modal__subtitle">
				{ translate( 'Choose a layout for this space.' ) }
			</p>
			<div
				className="customize-space-modal__grid"
				role="radiogroup"
				aria-label={ translate( 'Layout' ) }
			>
				{ presets.map( ( preset ) => (
					<label
						key={ preset.id }
						className="customize-space-modal__card"
						data-selected={ preset.id === value }
					>
						<input
							type="radio"
							className="customize-space-modal__radio"
							name="space-layout-view"
							value={ preset.id }
							checked={ preset.id === value }
							onChange={ () => onChange( preset.id ) }
						/>
						<span className="customize-space-modal__card-title">
							{ getLayoutPresetTitle( preset.id, translate ) }
							{ preset.beta && (
								<span className="customize-space-modal__card-beta">{ translate( 'Beta' ) }</span>
							) }
						</span>
						<span className="customize-space-modal__card-description">{ preset.description }</span>
					</label>
				) ) }
			</div>
			<p className="customize-space-modal__subtitle">
				{ translate( 'Choose the column width for this space.' ) }
			</p>
			<div
				className="customize-space-modal__grid"
				role="radiogroup"
				aria-label={ translate( 'Width' ) }
			>
				{ widths.map( ( option ) => (
					<label
						key={ option.id }
						className="customize-space-modal__card"
						data-selected={ option.id === width }
					>
						<input
							type="radio"
							className="customize-space-modal__radio"
							name="space-layout-width"
							value={ option.id }
							checked={ option.id === width }
							onChange={ () => onWidthChange( option.id ) }
						/>
						<span className="customize-space-modal__card-title">{ option.title }</span>
						<span className="customize-space-modal__card-description">{ option.description }</span>
					</label>
				) ) }
			</div>
		</VStack>
	);
}
