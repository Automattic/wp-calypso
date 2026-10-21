import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import versionCompare from 'calypso/lib/version-compare';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite, getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ScreenSwitcher, { DEFAULT_VIEW } from './screen-switcher';

import './style.scss';

const isBoolean = ( val ) => 'boolean' === typeof val;

const ScreenOptionsTab = ( { wpAdminPath } ) => {
	const ref = useRef( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const { _x } = useI18n();
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const jetpackVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);
	const isSsoActive = useSelector( ( state ) => isJetpackModuleActive( state, siteId, 'sso' ) );
	const plan = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );

	const handleToggle = useCallback(
		( bool ) => {
			if ( isBoolean( bool ) ) {
				setIsOpen( bool );
			} else {
				setIsOpen( ! isOpen );
			}
		},
		[ isOpen ]
	);

	const handleClosing = useCallback(
		( e ) => {
			if ( e instanceof KeyboardEvent ) {
				if ( e.key === 'Escape' ) {
					handleToggle( false );
				}
				return;
			}

			if ( ref.current && ! ref.current.contains( e.target ) ) {
				handleToggle( false );
			}
		},
		[ handleToggle ]
	);

	useEffect( () => {
		if ( isAtomic ) {
			dispatch( fetchModuleList( siteId ) );
		}
		// Close the component when a click outside happens or users clicks Esc key.
		document.addEventListener( 'click', handleClosing, true );
		document.addEventListener( 'keydown', handleClosing, true );

		return () => {
			// Lets cleanup after ourselves when the component unmounts.
			document.removeEventListener( 'click', handleClosing, true );
			document.removeEventListener( 'keydown', handleClosing, true );
		};
	}, [ siteId, isAtomic, dispatch, handleClosing ] );

	// Only visible on single-site screens of WordPress.com Simple and Atomic sites.
	if ( ! wpAdminPath || ! siteId || ( isJetpack && ! isAtomic ) ) {
		return null;
	}

	// Disable for Atomic sites that are running below Jetpack 9.9
	if ( isAtomic && jetpackVersion && versionCompare( jetpackVersion, '9.9-alpha', '<' ) ) {
		return null;
	}

	// Hide the quick switcher when SSO is inactive, since Nav Unification is disabled on WP Admin.
	if ( isAtomic && ! isSsoActive ) {
		return null;
	}

	const onSwitchView = ( view ) => {
		dispatch(
			recordTracksEvent( 'calypso_dashboard_quick_switch_link_clicked', {
				blog_id: siteId,
				current_page: wpAdminPath,
				destination: view,
				plan,
			} )
		);

		if ( view === DEFAULT_VIEW ) {
			setIsOpen( false );
		}
	};

	return (
		<div className="screen-options-tab" ref={ ref } data-testid="screen-options-tab">
			<button className="screen-options-tab__button" onClick={ handleToggle }>
				<span className="screen-options-tab__label">
					{ _x( 'View', 'View options to switch between' ) }
				</span>
				<span
					className={ clsx( 'screen-options-tab__icon', {
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
