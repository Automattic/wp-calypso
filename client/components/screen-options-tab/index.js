/**
 * External Dependencies
 */
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import config from '@automattic/calypso-config';

/**
 * Internal Dependencies
 */
import ScreenSwitcher, { DEFAULT_VIEW } from './screen-switcher';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite, getSiteOption } from 'calypso/state/sites/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import versionCompare from 'calypso/lib/version-compare';

/**
 * Style dependencies
 */
import './style.scss';

const isBoolean = ( val ) => 'boolean' === typeof val;

const ScreenOptionsTab = ( { wpAdminPath } ) => {
	const ref = useRef( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const jetpackVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);

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

	if ( ! config.isEnabled( 'nav-unification/switcher' ) ) {
		return null;
	}

	// Only visible on single-site screens of WordPress.com Simple and Atomic sites.
	if ( ! wpAdminPath || ! siteId || ( isJetpack && ! isAtomic ) ) {
		return null;
	}

	// Disable for Atomic sites that are running below Jetpack 9.9
	if ( isAtomic && jetpackVersion && versionCompare( jetpackVersion, '9.9-alpha', '<' ) ) {
		return null;
	}

	const onSwitchView = ( view ) => {
		if ( view === DEFAULT_VIEW ) {
			setIsOpen( false );
		}
	};

	return (
		<div className="screen-options-tab" ref={ ref } data-testid="screen-options-tab">
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
						<ScreenSwitcher onSwitch={ onSwitchView } wpAdminPath={ wpAdminPath } />
					</div>
				</div>
			) }
		</div>
	);
};

export default ScreenOptionsTab;
