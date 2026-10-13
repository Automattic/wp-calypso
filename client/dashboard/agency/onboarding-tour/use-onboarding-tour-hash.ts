import { useCallback, useEffect, useState } from 'react';
import { ONBOARDING_TOUR_HASH, replaceHash } from './onboarding-tour-hash';
import type { OnboardingTourSectionId } from './sections';

const SECTION_HASH_PREFIX = `${ ONBOARDING_TOUR_HASH }-`;

/**
 * Keeps the tour in the URL: `#onboarding-tour-{section}` opens it on that section, so a
 * reload or a shared link reopens it. The bare `#onboarding-tour` that sign-up adds is
 * dropped instead, since Overview greets new agencies on the page itself.
 */
export function useOnboardingTourHash() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ initialSectionId, setInitialSectionId ] = useState< OnboardingTourSectionId >();

	useEffect( () => {
		const handleHashChange = () => {
			const { hash } = window.location;
			if ( hash === ONBOARDING_TOUR_HASH ) {
				replaceHash( '' );
			} else if ( hash.startsWith( SECTION_HASH_PREFIX ) ) {
				setInitialSectionId( hash.slice( SECTION_HASH_PREFIX.length ) as OnboardingTourSectionId );
				setIsOpen( true );
			}
		};

		handleHashChange();
		window.addEventListener( 'hashchange', handleHashChange );
		return () => window.removeEventListener( 'hashchange', handleHashChange );
	}, [] );

	const open = useCallback( ( sectionId: OnboardingTourSectionId = 'overview' ) => {
		replaceHash( `${ SECTION_HASH_PREFIX }${ sectionId }` );
		setInitialSectionId( sectionId );
		setIsOpen( true );
	}, [] );

	const close = useCallback( () => {
		replaceHash( '' );
		setIsOpen( false );
	}, [] );

	return { isOpen, initialSectionId, open, close };
}
