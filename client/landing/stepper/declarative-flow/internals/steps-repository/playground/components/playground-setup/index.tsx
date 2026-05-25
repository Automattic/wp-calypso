import { useI18n } from '@wordpress/react-i18n';
import { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useImportBlueprint } from '../../lib/import-blueprint';
import { importPlaygroundSite } from '../../lib/import-playground';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import type { PlaygroundClient } from '../../lib/types';
import './style.scss';

export const PlaygroundSetupStep: Step< {
	submits: {
		siteSlug?: string;
		siteId: number;
	};
} > = ( props ) => {
	const { submit } = props.navigation;
	const { __ } = useI18n();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );
	const { siteId, siteSlug } = useSiteData();
	const [ query ] = useSearchParams();
	const { mutateAsync: importBlueprint } = useImportBlueprint();

	useEffect( () => {
		// If blueprint exists, import it and then submit
		const blueprint = query.get( 'blueprint' );
		if ( blueprint && submit && siteId ) {
			const runBlueprintImport = async () => {
				try {
					await importBlueprint( { blueprint, siteId } );
					submit( {
						siteSlug,
						siteId,
					} );
				} catch ( error ) {
					// Add error handling
					// eslint-disable-next-line no-console
					console.error( error );
				}
			};
			runBlueprintImport();
		}
	}, [ query, submit, siteSlug, siteId, importBlueprint ] );

	useEffect( () => {
		// Clean up any playground-related localStorage items on unmount
		return () => {
			const playgroundId = query.get( 'playground' );
			const currentTimestamp = Math.floor( Date.now() / 1000 );

			if ( playgroundId ) {
				window.localStorage.removeItem( 'playground-plans-intent-' + playgroundId );
				window.localStorage.removeItem( 'playground-plans-intent-' + playgroundId + '-ts' );
			}

			Object.keys( window.localStorage ).forEach( ( key ) => {
				if ( key.startsWith( 'playground-plans-intent-' ) && key.endsWith( '-ts' ) ) {
					const storedAt = parseInt( window.localStorage.getItem( key ) || '0' );
					if ( currentTimestamp - storedAt > 7 * 24 * 60 * 60 ) {
						window.localStorage.removeItem( key );
						window.localStorage.removeItem( key.replace( '-ts', '' ) );
					}
				}
			} );
		};
	}, [] );

	const startImport = async ( client: PlaygroundClient ) => {
		if ( ! client ) {
			return;
		}

		if ( ! submit ) {
			return;
		}

		await importPlaygroundSite( client, siteId );
		submit( {
			siteSlug,
			siteId,
		} );
	};

	const getStepContent = () => {
		const hasBlueprint = query.get( 'blueprint' );

		return (
			<>
				<Loading title={ __( 'Preparing your site for import' ) } />
				{ ! hasBlueprint && (
					<PlaygroundIframe
						className="playground__onboarding-iframe"
						playgroundClient={ playgroundClientRef.current }
						setPlaygroundClient={ startImport }
					/>
				) }
			</>
		);
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground Setup' ) } />
			<StepWrapper hideBack hideSkip stepContent={ getStepContent() } />
		</>
	);
};

export default PlaygroundSetupStep;
