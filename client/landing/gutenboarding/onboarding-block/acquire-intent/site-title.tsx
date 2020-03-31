/**
 * External dependencies
 */
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import Textarea from 'react-autosize-textarea';
import { ENTER } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';

const SiteTitle: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const history = useHistory();
	const makePath = usePath();
	const inputRef = useRef< HTMLTextAreaElement >( null );

	const handleChange = ( e: React.ChangeEvent< HTMLTextAreaElement > ) =>
		setSiteTitle( e.target.value.trim().length ? e.target.value : '' );

	const value = siteTitle.length ? siteTitle : '';

	const handleInputKeyDownEvent = ( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
		// As last input on first step, hitting 'Enter' should direct to next step.
		if ( e.keyCode === ENTER ) {
			e.preventDefault();
			history.push( makePath( Step.DesignSelection ) );
		}
	};

	useEffect( () => {
		if ( siteVertical ) {
			inputRef.current?.focus();
		}
	}, [ siteVertical, inputRef ] );

	// translators: Form input for a site's title where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = NO__( 'Itʼs called <Input />' );
	const madlib = __experimentalCreateInterpolateElement( madlibTemplate, {
		Input: (
			/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
			<div className="madlib__input-wrapper">
				<Textarea
					ref={ inputRef }
					/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
					className="madlib__input"
					autoComplete="off"
					autoCapitalize="off"
					spellCheck="false"
					value={ value }
					onChange={ handleChange }
					onKeyDown={ handleInputKeyDownEvent }
				/>
			</div>
		),
	} );

	return <form>{ madlib }</form>;
};

export default SiteTitle;
