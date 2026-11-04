import {
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { getStageLabel } from './lib/labels';
import type { AgencyResourceStage } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

type Stage = AgencyResourceStage | 'all';

interface StageFilterProps {
	view: View;
	onChangeView: ( view: View ) => void;
}

/**
 * Narrows the library to one stage. It drives an ordinary filter, so it's saved
 * with the rest of the view.
 */
export default function StageFilter( { view, onChangeView }: StageFilterProps ) {
	// The toggle doesn't fit beside the toolbar on narrow screens.
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	const options: { value: Stage; label: string; ariaLabel: string }[] = [
		{
			value: 'all',
			label: __( 'All' ),
			/* translators: Stage filter tooltip. Keep "All" matching the stage's button label. */
			ariaLabel: __( 'All: Resources for every stage.' ),
		},
		{
			value: 'learn',
			label: getStageLabel( 'learn' ),
			/* translators: Stage filter tooltip. Keep "Learn" matching the stage's button label. */
			ariaLabel: __( 'Learn: Get to know our products.' ),
		},
		{
			value: 'sell',
			label: getStageLabel( 'sell' ),
			/* translators: Stage filter tooltip. Keep "Sell" matching the stage's button label. */
			ariaLabel: __( 'Sell: Prepare for client conversations.' ),
		},
		{
			value: 'manage',
			label: getStageLabel( 'manage' ),
			/* translators: Stage filter tooltip. Keep "Manage" matching the stage's button label. */
			ariaLabel: __( 'Manage: Deliver and support client projects.' ),
		},
		{
			value: 'grow',
			label: getStageLabel( 'grow' ),
			/* translators: Stage filter tooltip. Keep "Grow" matching the stage's button label. */
			ariaLabel: __( 'Grow: Build your agency and partnerships.' ),
		},
	];
	const toStage = ( value: unknown ) =>
		options.find( ( option ) => option.value === value )?.value ?? 'all';

	const stage = toStage( view.filters?.find( ( filter ) => filter.field === 'stage' )?.value );
	const setStage = ( value: unknown ) => {
		const nextStage = toStage( value );
		onChangeView( {
			...view,
			filters: [
				...( view.filters ?? [] ).filter( ( filter ) => filter.field !== 'stage' ),
				...( nextStage === 'all'
					? []
					: [ { field: 'stage', operator: 'is' as const, value: nextStage } ] ),
			],
		} );
	};

	if ( isSmallViewport ) {
		return (
			<SelectControl
				label={ __( 'Stage' ) }
				hideLabelFromVision
				size="compact"
				value={ stage }
				options={ options.map( ( option ) => ( {
					value: option.value,
					label: option.value === 'all' ? __( 'All stages' ) : option.label,
				} ) ) }
				onChange={ setStage }
				__nextHasNoMarginBottom
			/>
		);
	}

	return (
		<ToggleGroupControl
			label={ __( 'Stage' ) }
			value={ stage }
			hideLabelFromVision
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			onChange={ setStage }
		>
			{ options.map( ( option ) => (
				<ToggleGroupControlOption
					key={ option.value }
					value={ option.value }
					label={ option.label }
					// The tooltip shows the aria-label, so it leads with the visible
					// name for assistive technology.
					aria-label={ option.ariaLabel }
					showTooltip
				/>
			) ) }
		</ToggleGroupControl>
	);
}
