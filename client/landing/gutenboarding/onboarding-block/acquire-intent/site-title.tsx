/**
 * External dependencies
 */
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';

interface Props {
	inputRef: React.RefObject< HTMLInputElement >;
}
const SiteTitle: React.FunctionComponent< Props > = ( { inputRef } ) => {
	const { __: NO__ } = useI18n();
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const history = useHistory();
	const makePath = usePath();

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value.trim().length ? e.target.value : '' );

	const value = siteTitle.length ? siteTitle : '';

	// translators: Form input for a site's title where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = NO__( 'Itʼs called <Input />' );
	const madlib = __experimentalCreateInterpolateElement( madlibTemplate, {
		Input: (
			<input
				ref={ inputRef }
				/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
				className="madlib__input"
				autoComplete="off"
				style={ {
					width: `${ value.length * 0.85 }ch`,
				} }
				onChange={ handleChange }
				value={ value }
			/>
		),
	} );

	// As last input on first step, hitting 'Enter' should direct to next step.
	const handleSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		history.push( makePath( Step.DesignSelection ) );
	};

	return <form onSubmit={ handleSubmit }>{ madlib }</form>;
};

export default SiteTitle;
