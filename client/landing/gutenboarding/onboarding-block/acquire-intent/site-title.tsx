/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';

interface Props {
	isVisible?: boolean;
	isMobile?: boolean; // needed as a prop to be defined when component mounts
}

const SiteTitle: React.FunctionComponent< Props > = ( { isVisible, isMobile } ) => {
	const { __ } = useI18n();
	const { siteTitle, siteVertical, wasVerticalSkipped } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
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
		if ( ( siteVertical?.label && isVisible ) || wasVerticalSkipped ) {
			inputRef.current.focus();
		}
	}, [ siteVertical, isVisible, inputRef, wasVerticalSkipped ] );

	// translators: Form input for a site's title where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const madlibTemplate = __( 'Itʼs called <Input />' );
	// translators: Form input for a site's title where "<Input />" is replaced by user input with an existing value.
	const madlibTemplateWithPeriod = __( 'Itʼs called <Input />.' );
	const madlib = createInterpolateElement(
		siteTitle.trim().length && ! isMobile ? madlibTemplateWithPeriod : madlibTemplate,
		{
			Input: (
				<span className="site-title__input-wrapper">
					{ ! isMobile && ' ' }
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
		}
	);

	return (
		/* eslint-disable jsx-a11y/click-events-have-key-events */
		/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
		<form
			className={ classnames( 'site-title', {
				'site-title--hidden': ! isVisible,
			} ) }
			onClick={ () => inputRef.current.focus() } // focus the input when clicking label or next to it
		>
			{ madlib }
		</form>
	);
};

export default SiteTitle;
