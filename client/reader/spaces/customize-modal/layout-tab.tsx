import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { SpaceFeedLayout } from '@automattic/api-core';

type TranslateFn = ReturnType< typeof useTranslate >;

interface Props {
	value: SpaceFeedLayout;
	onChange: ( view: SpaceFeedLayout ) => void;
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
export function LayoutTab( { value, onChange }: Props ) {
	const translate = useTranslate();

	const presets: { id: SpaceFeedLayout; description: string; beta?: boolean }[] = [
		{ id: 'legacy', description: translate( 'Classic Reader stream' ) },
		{ id: 'standard-list', description: translate( 'Many items, fast scanning' ), beta: true },
		{ id: 'gallery', description: translate( 'Grid of cards with thumbnails' ), beta: true },
		{ id: 'board', description: translate( 'Big roomy cards, casual scroll' ), beta: true },
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
		</VStack>
	);
}
