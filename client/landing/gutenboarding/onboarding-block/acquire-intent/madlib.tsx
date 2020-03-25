/**
 * External dependencies
 */
import React from 'react';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';

interface Props extends React.HTMLProps< HTMLInputElement > {
	/**
	 * Interpolated string. Should include `<Input />`.
	 */
	children: string;
	value?: string;
}
const MadLib: React.FunctionComponent< Props > = ( { children, ...props } ) => {
	const content = __experimentalCreateInterpolateElement( children, {
		Input: (
			<input
				className="madlib__input"
				autoComplete="off"
				style={ {
					width: `${ props.value?.length ?? 0 * 0.85 }ch`,
				} }
				{ ...props }
			/>
		),
	} );
	return <label className="madlib">{ content }</label>;
};

export default MadLib;
