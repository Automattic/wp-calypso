/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useState } from 'react';
import { numberFormat } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Label from './label';

const ModuleChartXAxis = ( { data, isRtl, labelWidth, chartWidth } ) => {
	const dataCount = data.length || 1;
	const [ spacing, setSpacing ] = useState( labelWidth );
	const [ divisor, setDivisor ] = useState( 1 );

	useLayoutEffect( () => {
		const resize = () => {
			const width = chartWidth;
			const newSpacing = width / dataCount;

			setSpacing( newSpacing );
			setDivisor( Math.ceil( labelWidth / newSpacing ) );
		};

		resize();

		window.addEventListener( 'resize', resize );

		return () => {
			window.removeEventListener( 'resize', resize );
		};
	}, [ dataCount, labelWidth, chartWidth ] );

	const labels = data.map( function ( item, index ) {
		const x = index * spacing + ( spacing - labelWidth ) / 2;
		const rightIndex = data.length - index - 1;
		let label;

		if ( rightIndex % divisor === 0 ) {
			label = (
				<Label isRtl={ isRtl } key={ index } label={ item.label } width={ labelWidth } x={ x } />
			);
		}

		return label;
	} );

	return (
		<div className="chart__x-axis">
			{ labels }
			<div className="chart__x-axis-label chart__x-axis-width-spacer">{ numberFormat( 1e5 ) }</div>
		</div>
	);
};

ModuleChartXAxis.propTypes = {
	data: PropTypes.array.isRequired,
	isRtl: PropTypes.bool,
	labelWidth: PropTypes.number.isRequired,
};

export default ModuleChartXAxis;
