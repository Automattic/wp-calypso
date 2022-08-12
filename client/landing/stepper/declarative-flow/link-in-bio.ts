import { isEnabled } from '@automattic/calypso-config';
import { useSiteLogoMutation } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../hooks/use-site';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
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
			'linkInBioProcessingStep',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );
		const siteSlugParam = useSiteSlugParam();
		const { setPendingAction, setProgress, setProgressTitle } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings } = useDispatch( SITE_STORE );
		const site = useSite();
		const { mutateAsync: setSiteLogo } = useSiteLogoMutation( site?.ID );
		const { __ } = useI18n();

		const { getState } = useSelect( ( select ) => select( ONBOARD_STORE ) );

		const base64ImageToBlob = ( base64String: string ) => {
			// extract content type and base64 payload from original string
			const pos = base64String.indexOf( ';base64,' );
			const type = base64String.substring( 5, pos );
			const b64 = base64String.substr( pos + 8 );

			// decode base64
			const imageContent = atob( b64 );

			// create an ArrayBuffer and a view (as unsigned 8-bit)
			const buffer = new ArrayBuffer( imageContent.length );
			const view = new Uint8Array( buffer );

			// fill the view, using the decoded base64
			for ( let n = 0; n < imageContent.length; n++ ) {
				view[ n ] = imageContent.charCodeAt( n );
			}

			// convert ArrayBuffer to Blob
			const blob = new Blob( [ buffer ], { type: type } );

			return blob;
		};

		const flowEnd = () => {
			if ( site ) {
				setPendingAction( async () => {
					setProgress( 0 );
					setProgressTitle( __( 'Creating your Link in bio' ) );
					const state = getState();
					await saveSiteSettings( site.ID, {
						blogname: state.siteTitle,
						blogdescription: state.siteDescription,
					} );

					setProgress( 0.5 );
					setProgressTitle( __( 'Adding your domain' ) );

					recordTracksEvent( 'calypso_signup_site_options_submit', {
						has_site_title: !! state.siteTitle,
						has_tagline: !! state.siteDescription,
					} );

					setProgress( 0.8 );
					setProgressTitle( __( 'Adding your plan' ) );

					if ( state.siteLogo ) {
						try {
							await setSiteLogo(
								new File( [ base64ImageToBlob( state.siteLogo ) ], 'site-logo.png' )
							);
						} catch ( _error ) {
							// communicate the error to the user
						}
					}
					setProgress( 1 );
					setProgressTitle( __( 'Preparing next steps' ) );
				} );
				navigate( 'linkInBioProcessingStep' );
			}
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;
			switch ( _currentStep ) {
				case 'linkInBioSetup': //this will be Checkout
					return flowEnd();
				case 'linkInBioProcessingStep':
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
