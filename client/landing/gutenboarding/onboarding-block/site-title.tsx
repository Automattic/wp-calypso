/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React, { createRef, FunctionComponent, useEffect } from 'react';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { StepProps } from './stepper-wizard';
import Question from './question';

const SiteTitle: FunctionComponent< StepProps > = ( {
	onSelect,
	inputClass,
	isActive,
	onExpand,
} ) => {
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value.trim().length ? e.target.value : '' );

	const label = NO__( "It's called" );
	const value = siteTitle.length ? siteTitle : NO__( 'enter a title' );

	// Focus the input when we change to active
	const inputRef = createRef< HTMLInputElement >();
	useEffect( () => {
		if ( isActive && document.activeElement !== inputRef.current ) {
			inputRef.current?.focus();
		}
	}, [ isActive, inputRef ] );

	return (
		<>
			<Question label={ label } displayValue={ value } isActive={ isActive } onExpand={ onExpand }>
				<input
					ref={ inputRef }
					className={ inputClass }
					placeholder={ NO__( 'enter a title' ) }
					onChange={ handleChange }
					onBlur={ onSelect }
					value={ siteTitle }
				/>
			</Question>
		</>
	);
};

export default SiteTitle;
