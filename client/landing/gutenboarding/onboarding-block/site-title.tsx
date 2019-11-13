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

interface Props {
	onSelect: () => void;
}

export default function SiteTitle( { onSelect }: Props ) {
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value );

	return (
		<input
			className="onboarding-block__question-input"
			placeholder={ NO__( 'enter a title' ) }
			onChange={ handleChange }
			onBlur={ onSelect }
			value={ siteTitle }
		/>
	);
}
