import './style.scss';

const BODY_CLASS = 'is-arcade-mode';
const FLASH_CLASS = 'is-arcade-mode--just-activated';
const FLASH_DURATION_MS = 1500;
const FONT_LINK_ID = 'arcade-mode-font';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
const LIVES_ID = 'arcade-mode-lives';

let active = false;
let escapeListener: ( ( event: KeyboardEvent ) => void ) | null = null;
let flashTimeout: number | null = null;

function isEditableTarget( target: EventTarget | null ): boolean {
	if ( ! ( target instanceof HTMLElement ) ) {
		return false;
	}
	const tag = target.tagName;
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function loadFont(): void {
	if ( document.getElementById( FONT_LINK_ID ) ) {
		return;
	}
	const link = document.createElement( 'link' );
	link.id = FONT_LINK_ID;
	link.rel = 'stylesheet';
	link.href = FONT_HREF;
	document.head.appendChild( link );
}

function mountLivesCounter(): void {
	if ( document.getElementById( LIVES_ID ) ) {
		return;
	}
	const wrapper = document.createElement( 'div' );
	wrapper.id = LIVES_ID;
	wrapper.className = 'masterbar__item-wrapper';
	wrapper.innerHTML =
		'<div class="masterbar__item arcade-lives" aria-label="30 lives" role="status">' +
		'<span class="arcade-lives__icon" aria-hidden="true">🕹</span>' +
		'<span class="masterbar__item-content">30 LIVES</span>' +
		'</div>';

	const section = document.querySelector( '.masterbar__section--right' );
	if ( ! section ) {
		return;
	}
	const profile = section.querySelector( '.masterbar__item-howdy' );
	const profileWrapper =
		( profile?.closest( '.masterbar__item-wrapper' ) as Element | null ) ?? profile;
	if ( profileWrapper && profileWrapper.parentElement === section ) {
		section.insertBefore( wrapper, profileWrapper );
	} else {
		section.appendChild( wrapper );
	}
}

function deactivate(): void {
	if ( ! active ) {
		return;
	}
	active = false;
	document.body.classList.remove( BODY_CLASS, FLASH_CLASS );
	document.getElementById( LIVES_ID )?.remove();
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
	active = true;

	document.body.classList.add( BODY_CLASS, FLASH_CLASS );
	loadFont();
	mountLivesCounter();

	flashTimeout = window.setTimeout( () => {
		document.body.classList.remove( FLASH_CLASS );
		flashTimeout = null;
	}, FLASH_DURATION_MS );

	escapeListener = ( event ) => {
		if ( event.key === 'Escape' && ! isEditableTarget( event.target ) ) {
			deactivate();
		}
	};
	document.addEventListener( 'keydown', escapeListener );
}
