import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';
import clsx from 'clsx';
import { FC } from 'react';
import styles from './legend.module.scss';
import type { LegendProps } from './types';

/**
 * Base legend component that displays color-coded items with labels using visx
 * @param {object} props             - Component properties
 * @param {Array}  props.items       - Array of legend items to display
 * @param {string} props.className   - Additional CSS class names
 * @param {string} props.orientation - Layout orientation (horizontal/vertical)
 * @return {JSX.Element}               Rendered legend component
 */
const orientationToFlexDirection = {
	horizontal: 'row' as const,
	vertical: 'column' as const,
};

export const BaseLegend: FC< LegendProps > = ( {
	items,
	className,
	orientation = 'horizontal',
} ) => {
	const legendScale = scaleOrdinal( {
		domain: items.map( item => item.label ),
		range: items.map( item => item.color ),
	} );

	return (
		<div
			className={ clsx( styles.legend, styles[ `legend--${ orientation }` ], className ) }
			role="list"
		>
			<LegendOrdinal
				scale={ legendScale }
				direction={ orientationToFlexDirection[ orientation ] }
				shape="rect"
				shapeWidth={ 16 }
				shapeHeight={ 16 }
				className={ styles[ 'legend-items' ] }
			>
				{ labels => (
					<div className={ styles[ `legend--${ orientation }` ] }>
						{ labels.map( label => (
							<div key={ label.text } className={ styles[ 'legend-item' ] }>
								<svg width={ 16 } height={ 16 }>
									<rect
										width={ 16 }
										height={ 16 }
										fill={ label.value }
										className={ styles[ 'legend-item-swatch' ] }
									/>
								</svg>
								<span className={ styles[ 'legend-item-label' ] }>
									{ label.text }
									{ items.find( item => item.label === label.text )?.value && (
										<span className={ styles[ 'legend-item-value' ] }>
											{ items.find( item => item.label === label.text )?.value }
										</span>
									) }
								</span>
							</div>
						) ) }
					</div>
				) }
			</LegendOrdinal>
		</div>
	);
};
