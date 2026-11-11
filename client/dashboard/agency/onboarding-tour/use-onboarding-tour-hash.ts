import { useCallback, useEffect, useState } from 'react';
import { ONBOARDING_TOUR_HASH, replaceHash } from './onboarding-tour-hash';
import { isOnboardingTourSectionId } from './section-ids';
import type { OnboardingTourSectionId } from './section-ids';

const SECTION_HASH_PREFIX = `${ ONBOARDING_TOUR_HASH }-`;

/**
 * Keeps the tour and its section in the URL: `#onboarding-tour-{section}` opens it on that
 * section, so a reload or a shared link reopens it, and an unknown section opens on the first
 * one. The bare `#onboarding-tour` that sign-up adds is dropped instead, since Overview greets
 * new agencies on the page itself.
 */
export function useOnboardingTourHash() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ sectionId, setSectionId ] = useState< OnboardingTourSectionId >( 'overview' );

	const open = useCallback( ( id: OnboardingTourSectionId = 'overview' ) => {
		replaceHash( `${ SECTION_HASH_PREFIX }${ id }` );
		setSectionId( id );
		setIsOpen( true );
	}, [] );

	useEffect( () => {
		const handleHashChange = () => {
			const { hash } = window.location;
			if ( hash === ONBOARDING_TOUR_HASH ) {
				replaceHash( '' );
			} else if ( hash.startsWith( SECTION_HASH_PREFIX ) ) {
				const id = hash.slice( SECTION_HASH_PREFIX.length );
				open( isOnboardingTourSectionId( id ) ? id : undefined );
			}
		};

		handleHashChange();
		window.addEventListener( 'hashchange', handleHashChange );
		return () => window.removeEventListener( 'hashchange', handleHashChange );
	}, [ open ] );

	const close = useCallback( () => {
		replaceHash( '' );
		setIsOpen( false );
	}, [] );

	return { isOpen, sectionId, open, close };
}
