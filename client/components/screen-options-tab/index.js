/**
 * External Dependencies
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useI18n } from '@wordpress/react-i18n';

/**
 * Style dependencies
 */
import './style.scss';

const isBoolean = ( val ) => 'boolean' === typeof val;

const ScreenOptionsTab = ( { children } ) => {
	const ref = useRef( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const { __ } = useI18n();

	const handleToggle = ( bool ) => {
		if ( isBoolean( bool ) ) {
			setIsOpen( bool );
		} else {
			setIsOpen( ! isOpen );
		}
	};

	const handleClosing = ( e ) => {
		if ( e instanceof KeyboardEvent ) {
			if ( e.key === 'Escape' ) {
				handleToggle( false );
			}
			return;
		}

		if ( ref.current && ! ref.current.contains( e.target ) ) {
			handleToggle( false );
			return;
		}
	};

	useEffect( () => {
		// Close the component when a click outside happens or users clicks Esc key.
		document.addEventListener( 'click', handleClosing, true );
		document.addEventListener( 'keydown', handleClosing, true );

		return () => {
			// Lets cleanup after ourselves when the component unmounts.
			document.removeEventListener( 'click', handleClosing, true );
			document.removeEventListener( 'keydown', handleClosing, true );
		};
	}, [] );

	return (
		<div className="screen-options-tab" ref={ ref }>
			<button className="screen-options-tab__button" onClick={ handleToggle }>
				<span className="screen-options-tab__label">{ __( 'Screen Options' ) }</span>
				<span
					className={ classNames( 'screen-options-tab__icon', {
						'screen-options-tab__icon--open': isOpen,
						'screen-options-tab__icon--closed': ! isOpen,
					} ) }
				/>
			</button>
			{ isOpen && <div className={ 'screen-options-tab__children' }>{ children }</div> }
		</div>
	);
};

export default ScreenOptionsTab;
