/**
 * WordPress dependencies
 */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../../components/dataviews-context';
import type { ViewTable, Density } from '../../types';

export default function DensityPicker() {
	const context = useContext( DataViewsContext );
	const view = context.view as ViewTable;
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			size="__unstable-large"
			label={ __( 'Density' ) }
			value={ view.layout?.density || 'balanced' }
			onChange={ ( value ) => {
				context.onChangeView( {
					...view,
					layout: {
						...view.layout,
						density: value as Density,
					},
				} );
			} }
			isBlock
		>
			<ToggleGroupControlOption
				key="comfortable"
				value="comfortable"
				label={ _x(
					'Comfortable',
					'Density option for DataView layout'
				) }
			/>
			<ToggleGroupControlOption
				key="balanced"
				value="balanced"
				label={ _x( 'Balanced', 'Density option for DataView layout' ) }
			/>
			<ToggleGroupControlOption
				key="compact"
				value="compact"
				label={ _x( 'Compact', 'Density option for DataView layout' ) }
			/>
		</ToggleGroupControl>
	);
}
