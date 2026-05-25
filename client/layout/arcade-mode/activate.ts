import { unlockAchievement } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import './style.scss';

const BODY_CLASS = 'is-arcade-mode';
const FLASH_CLASS = 'arcade-mode-flash';
const FLASH_DURATION_MS = 1500;
const LIVES_ID = 'arcade-mode-lives';
const MASTERBAR_RIGHT_SELECTOR = '.masterbar__section--right';

let active = false;
let escapeListener: ( ( event: KeyboardEvent ) => void ) | null = null;
let flashTimeout: number | null = null;
let flashElement: HTMLElement | null = null;

function isEditableTarget( target: EventTarget | null ): boolean {
	if ( ! ( target instanceof HTMLElement ) ) {
		return false;
	}
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function mountLivesCounter( section: Element ): void {
	if ( document.getElementById( LIVES_ID ) ) {
		return;
	}
	const wrapper = document.createElement( 'div' );
	wrapper.id = LIVES_ID;
	wrapper.className = 'masterbar__item-wrapper';

	const item = document.createElement( 'div' );
	item.className = 'masterbar__item arcade-lives';
	item.setAttribute( 'role', 'status' );
	item.setAttribute( 'aria-label', __( '30 lives' ) );

	const icon = document.createElement( 'span' );
	icon.className = 'arcade-lives__icon';
	icon.setAttribute( 'aria-hidden', 'true' );
	icon.textContent = '🕹';

	const label = document.createElement( 'span' );
	label.className = 'masterbar__item-content';
	label.textContent = __( '30 LIVES' );

	item.appendChild( icon );
	item.appendChild( label );
	wrapper.appendChild( item );

	const profile = section.querySelector( '.masterbar__item-howdy' );
	const profileWrapper =
		( profile?.closest( '.masterbar__item-wrapper' ) as Element | null ) ?? profile;
	if ( profileWrapper && profileWrapper.parentElement === section ) {
		section.insertBefore( wrapper, profileWrapper );
	} else {
		section.appendChild( wrapper );
	}
}

function mountFlashBanner(): void {
	flashElement = document.createElement( 'div' );
	flashElement.className = FLASH_CLASS;
	flashElement.setAttribute( 'role', 'status' );
	flashElement.textContent = __( 'ARCADE MODE ACTIVATED' );
	document.body.appendChild( flashElement );
}

function unlockArcadeAchievement(): void {
	unlockAchievement( 'arcade_mode' )
		.then( ( result ) => {
			if ( result.granted ) {
				getCalypsoQueryClient()?.invalidateQueries( {
					queryKey: [ 'read', 'achievements' ],
				} );
			}
		} )
		.catch( () => {
			// Easter egg — never bother the user with errors.
		} );
}

function deactivate(): void {
	if ( ! active ) {
		return;
	}
	active = false;
	document.body.classList.remove( BODY_CLASS );
	document.getElementById( LIVES_ID )?.remove();
	flashElement?.remove();
	flashElement = null;
	if ( escapeListener ) {
		document.removeEventListener( 'keydown', escapeListener );
		escapeListener = null;
	}
	if ( flashTimeout !== null ) {
		window.clearTimeout( flashTimeout );
		flashTimeout = null;
	}
}

export function activateArcadeMode(): void {
	if ( active ) {
		return;
	}
	// Arcade mode renders chrome inside the masterbar. Surfaces without a
	// masterbar (logged-out flows, EmptyMasterbar, MSD Reader, checkout-failed)
	// would only get a partial activation, so bail before any side effects.
	const section = document.querySelector( MASTERBAR_RIGHT_SELECTOR );
	if ( ! section ) {
		return;
	}

	active = true;

	bumpStat( 'calypso_easter_eggs', 'arcade_mode_activated' );

	document.body.classList.add( BODY_CLASS );
	mountLivesCounter( section );
	mountFlashBanner();

	flashTimeout = window.setTimeout( () => {
		flashElement?.remove();
		flashElement = null;
		flashTimeout = null;
	}, FLASH_DURATION_MS );

	escapeListener = ( event ) => {
		if ( event.key === 'Escape' && ! isEditableTarget( event.target ) ) {
			deactivate();
		}
	};
	document.addEventListener( 'keydown', escapeListener );

	unlockArcadeAchievement();
}
