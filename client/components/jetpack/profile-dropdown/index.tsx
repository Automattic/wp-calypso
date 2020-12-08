/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gravatar from 'calypso/components/gravatar';
import userUtilities from 'calypso/lib/user/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Hook that executes `callback` is the 'Escape' key is pressed
 * or if the user clicks outside of `ref`.
 *
 * @param ref       Ref to an HTML element
 * @param callback  Function to be executed
 */
const useCallIfOutOfContext = (
	ref: React.MutableRefObject< null | HTMLElement >,
	callback: Function
) => {
	const handleEscape = React.useCallback(
		( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				callback();
			}
		},
		[ callback ]
	);

	const handleClick = React.useCallback(
		( { target } ) => {
			if ( ref.current && ! ref.current.contains( target ) ) {
				callback();
			}
		},
		[ ref, callback ]
	);

	React.useEffect( () => {
		document.addEventListener( 'keydown', handleEscape );
		document.addEventListener( 'click', handleClick );

		return () => {
			document.removeEventListener( 'keydown', handleEscape );
			document.removeEventListener( 'click', handleClick );
		};
	}, [ handleClick, handleEscape ] );
};

interface Props {
	isOpen: boolean;
	close: Function;
}

const ProfileDropdown: React.FC< Props > = ( { isOpen, close } ) => {
	const translate = useTranslate();
	const user = useSelector( getCurrentUser );
	const logOut = ( e: MouseEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		userUtilities.logout();
	};
	const trackedLogOut = useTrackCallback( logOut, 'calypso_jetpack_settings_masterbar_logout' );
	const ref = React.useRef( null );
	// We don't want to call close if it's already closed because we would
	// track unnecessary events.
	const closeOnlyIfIsOpen = React.useCallback( () => {
		isOpen && close();
	}, [ close, isOpen ] );
	useCallIfOutOfContext( ref, closeOnlyIfIsOpen );

	return (
		<div className="profile-dropdown" ref={ ref }>
			<Gravatar user={ user } alt={ translate( 'My Profile' ) } size={ 18 } />
			<span className="profile-dropdown__me-label">
				{ translate( 'My Profile', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
			</span>
			{ isOpen && (
				<div className="profile-dropdown__items">
					<div className="profile-dropdown__logout-item">
						<Gravatar
							className="profile-dropdown__logout-gravatar"
							user={ user }
							alt={ translate( 'My Profile' ) }
							size={ 64 }
						/>
						<span className="profile-dropdown__me-label">
							{ translate( 'My Profile', {
								context: 'Toolbar, must be shorter than ~12 chars',
							} ) }
						</span>

						<div className="profile-dropdown__logout-username">
							<span>{ user.username }</span>
							<Button borderless onClick={ trackedLogOut }>
								{ translate( 'Log out' ) }
							</Button>
						</div>

						<div className="profile-dropdown__empty-space"></div>
					</div>
				</div>
			) }
		</div>
	);
};

export default ProfileDropdown;
