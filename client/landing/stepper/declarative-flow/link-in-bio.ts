import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { redirect } from './internals/steps-repository/import/util';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const linkInBio: Flow = {
	name: 'link-in-bio',
	title: 'Link in Bio',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'linkInBioSetup',
			'processing',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );
		const siteSlugParam = useSiteSlugParam();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;
			switch ( _currentStep ) {
				case 'linkInBioSetup':
					return navigate( 'processing' );
				case 'processing':
					// Change later where it should point the user to.
					return redirect( `/page/${ siteSlug }/home` );
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			navigate( 'linkInBioSetup' );
			return;
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
