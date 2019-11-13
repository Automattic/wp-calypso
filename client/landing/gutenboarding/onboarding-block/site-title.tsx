/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React from 'react';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../store';
import { StepInputProps } from './question';

export default function SiteTitle( { onSelect, inputClass }: StepInputProps ) {
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value );

	return (
		<input
			className={ inputClass }
			placeholder={ NO__( 'enter a title' ) }
			onChange={ handleChange }
			onBlur={ onSelect }
			value={ siteTitle }
		/>
	);
}
