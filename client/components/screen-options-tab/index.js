/**
 * External Dependencies
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useI18n } from '@wordpress/react-i18n';

/**
 * Internal Dependencies
 */
import config from '@automattic/calypso-config';
import ScreenSwitcher from './screen-switcher';

/**
 * Style dependencies
 */
import './style.scss';

const isBoolean = ( val ) => 'boolean' === typeof val;

const isRunningInJest = () => process.env.JEST_WORKER_ID !== undefined;

const ScreenOptionsTab = () => {
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

	// If the component is running in Jest lets render for the component tests.
	if ( ! config.isEnabled( 'nav-unification/switcher' ) && ! isRunningInJest() ) {
		return null;
	}

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
			{ isOpen && (
				<div className="screen-options-tab__wrapper">
					<div className="screen-options-tab__dropdown" data-testid="screen-options-dropdown">
						<ScreenSwitcher />
					</div>
				</div>
			) }
		</div>
	);
};

export default ScreenOptionsTab;
