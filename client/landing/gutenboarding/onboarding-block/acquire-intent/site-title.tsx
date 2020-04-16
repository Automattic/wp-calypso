/**
 * External dependencies
 */
import React from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { createInterpolateElement } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';

interface Props {
	isVisible: boolean;
}

const SiteTitle: React.FunctionComponent< Props > = ( { isVisible } ) => {
	const { __ } = useI18n();
	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const history = useHistory();
	const makePath = usePath();
	const inputRef = React.useRef< HTMLSpanElement >( document.createElement( 'span' ) );

	const handleKeyDown = ( e: React.KeyboardEvent< HTMLSpanElement > ) => {
		if ( e.keyCode === ENTER ) {
			// As last input on first step, hitting 'Enter' should direct to next step.
			e.preventDefault();
			history.push( makePath( Step.DesignSelection ) );
		}
	};

	const handleKeyUp = ( e: React.KeyboardEvent< HTMLSpanElement > ) =>
		setSiteTitle( e.currentTarget.innerText.trim().length ? e.currentTarget.innerText : '' );

	React.useEffect( () => {
		if ( siteTitle ) {
			inputRef.current.innerText = siteTitle;
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	React.useEffect( () => {
		if ( siteVertical?.label && isVisible ) {
			inputRef.current.focus();
		}
	}, [ siteVertical, isVisible, inputRef ] );

	// translators: Form input for a site's title where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = __( 'Itʼs called <Input />' );
	const madlib = createInterpolateElement( madlibTemplate, {
		Input: (
			<span className="site-title__input-wrapper">
				<span
					contentEditable
					tabIndex={ 0 }
					role="textbox"
					aria-multiline="true"
					spellCheck={ false }
					ref={ inputRef }
					/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
					className="madlib__input"
					onKeyDown={ handleKeyDown }
					onKeyUp={ handleKeyUp }
				/>
			</span>
		),
	} );

	return (
		<form
			className={ classnames( 'site-title', {
				'site-title--without-value': ! siteTitle.length,
				'site-title--hidden': ! isVisible,
			} ) }
		>
			{ madlib }
		</form>
	);
};

export default SiteTitle;
