/**
 * WordPress dependencies
 */
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataViewsContext from '../../components/dataviews-context';
import type { ViewGrid } from '../../types';

const viewportBreaks: {
	[ key: string ]: { min: number; max: number; default: number };
} = {
	xhuge: { min: 3, max: 6, default: 5 },
	huge: { min: 2, max: 4, default: 4 },
	xlarge: { min: 2, max: 3, default: 3 },
	large: { min: 1, max: 2, default: 2 },
	mobile: { min: 1, max: 2, default: 2 },
};

/**
 * Breakpoints were adjusted from media queries breakpoints to account for
 * the sidebar width. This was done to match the existing styles we had.
 */
const BREAKPOINTS = {
	xhuge: 1520,
	huge: 1140,
	xlarge: 780,
	large: 480,
	mobile: 0,
};

function useViewPortBreakpoint() {
	const containerWidth = useContext( DataViewsContext ).containerWidth;
	for ( const [ key, value ] of Object.entries( BREAKPOINTS ) ) {
		if ( containerWidth >= value ) {
			return key;
		}
	}
	return 'mobile';
}

export function useUpdatedPreviewSizeOnViewportChange() {
	const view = useContext( DataViewsContext ).view as ViewGrid;
	const viewport = useViewPortBreakpoint();
	return useMemo( () => {
		const previewSize = view.layout?.previewSize;
		let newPreviewSize;
		if ( ! previewSize ) {
			return;
		}
		const breakValues = viewportBreaks[ viewport ];
		if ( previewSize < breakValues.min ) {
			newPreviewSize = breakValues.min;
		}
		if ( previewSize > breakValues.max ) {
			newPreviewSize = breakValues.max;
		}
		return newPreviewSize;
	}, [ viewport, view ] );
}

export default function PreviewSizePicker() {
	const viewport = useViewPortBreakpoint();
	const context = useContext( DataViewsContext );
	const view = context.view as ViewGrid;
	const breakValues = viewportBreaks[ viewport ];
	const previewSizeToUse = view.layout?.previewSize || breakValues.default;
	const marks = useMemo(
		() =>
			Array.from(
				{ length: breakValues.max - breakValues.min + 1 },
				( _, i ) => {
					return {
						value: breakValues.min + i,
					};
				}
			),
		[ breakValues ]
	);
	if ( viewport === 'mobile' ) {
		return null;
	}
	return (
		<RangeControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			showTooltip={ false }
			label={ __( 'Preview size' ) }
			value={ breakValues.max + breakValues.min - previewSizeToUse }
			marks={ marks }
			min={ breakValues.min }
			max={ breakValues.max }
			withInputField={ false }
			onChange={ ( value = 0 ) => {
				context.onChangeView( {
					...view,
					layout: {
						...view.layout,
						previewSize: breakValues.max + breakValues.min - value,
					},
				} );
			} }
			step={ 1 }
		/>
	);
}
