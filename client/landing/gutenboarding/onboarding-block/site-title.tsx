/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React, { createRef, FunctionComponent, useEffect } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { InjectedStepProps } from './stepper-wizard';
import Question from './question';

const SiteTitle: FunctionComponent< InjectedStepProps > = ( {
	onSelect,
	inputClass,
	isActive,
	onExpand,
} ) => {
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value );

	const label = NO__( "It's called" );
	const value = siteTitle.length ? siteTitle : NO__( 'enter a title' );

	// Focus the input when we change to active
	const inputRef = createRef< HTMLInputElement >();
	useEffect( () => {
		if ( isActive ) {
			inputRef.current?.focus();
		}
	}, [ isActive ] );

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
			<div className="onboarding-block__footer">
				<Button className="onboarding-block__question-skip" isLink>
					{ NO__( "Don't know yet" ) } →
				</Button>
			</div>
		</>
	);
};

export default SiteTitle;
