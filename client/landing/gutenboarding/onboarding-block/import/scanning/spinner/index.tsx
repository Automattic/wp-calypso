import { shuffle } from 'lodash';
import React, { useState, useEffect } from 'react';
import './style.scss';

const Spinner: React.FunctionComponent = () => {
	const animationDelay = 2000;
	const hideClass = 'spinner__shape-hide';
	const firstChunkShapes = [ 'circle', 'rectangle', 'semicircle' ];
	const secondChunkShapes = [ 'rhombus', 'semicircle-2', 'circle' ];

	const [ chunkClasses, setChunkClasses ] = useState( {
		first: {
			hide: '',
			shapes: firstChunkShapes,
		},
		second: {
			hide: hideClass,
			shapes: secondChunkShapes,
		},
	} );

	useEffect( () => {
		const timer = setTimeout( () => {
			const hideFirstChunk = !! chunkClasses.first.hide;
			const hideSecondChunk = !! chunkClasses.second.hide;

			setChunkClasses( {
				first: {
					hide: hideFirstChunk ? '' : hideClass,
					shapes: hideFirstChunk ? shuffle( firstChunkShapes ) : chunkClasses.first.shapes,
				},
				second: {
					hide: hideSecondChunk ? '' : hideClass,
					shapes: hideFirstChunk ? shuffle( secondChunkShapes ) : chunkClasses.second.shapes,
				},
			} );
		}, animationDelay );

		return () => {
			clearTimeout( timer );
		};
	} );

	return (
		<div className={ 'spinner__fancy' }>
			<div
				className={ `spinner__shape-${ chunkClasses.first.shapes[ 0 ] } spinner__color-2 ${ chunkClasses.first.hide }` }
			/>
			<div
				className={ `spinner__shape-${ chunkClasses.first.shapes[ 1 ] } spinner__color-1 ${ chunkClasses.first.hide }` }
			/>
			<div
				className={ `spinner__shape-${ chunkClasses.first.shapes[ 2 ] } spinner__color-3 ${ chunkClasses.first.hide }` }
			/>

			<div
				className={ `spinner__shape-${ chunkClasses.second.shapes[ 0 ] } spinner__color-1 ${ chunkClasses.second.hide }` }
			/>
			<div
				className={ `spinner__shape-${ chunkClasses.second.shapes[ 1 ] } spinner__color-2 ${ chunkClasses.second.hide }` }
			/>
			<div
				className={ `spinner__shape-${ chunkClasses.second.shapes[ 2 ] } spinner__color-1 ${ chunkClasses.second.hide }` }
			/>
		</div>
	);
};

export default Spinner;
