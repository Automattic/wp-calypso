import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { PlaygroundClient } from '@wp-playground/client';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import wp from 'calypso/lib/wp';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../../../hooks/use-is-playground-eligible';
import { clearImport, getImportStatus, importPlaygroundSite } from '../../lib/import-playground';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import './style.scss';

export const PlaygroundSetupStep: Step = () => {
	const isPlaygroundEligible = useIsPlaygroundEligible();
	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );
	}
	const { __ } = useI18n();
	const [ importStatus, setImportStatus ] = useState< string >( __( 'Loading Playground' ) );
	const siteIdRef = useRef< number | null >( null );
	const importIdRef = useRef< string | null >( null );
	const [ importInterval, setImportInterval ] = useState< NodeJS.Timeout | null >( null );
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );

	const siteSlug = getQueryArg( window.location.href, 'siteSlug' )?.toString();

	const checkImportStatus = async () => {
		if ( ! siteIdRef.current ) {
			return;
		}
		const importStatus = await getImportStatus( siteIdRef.current! );
		setImportStatus( importStatus );
		if ( importStatus === 'completed' || importStatus === undefined ) {
			if ( importInterval ) {
				clearInterval( importInterval );
			}
			window.location.replace( `/home/${ siteSlug }` );
		} else if ( 'importFailure' === importStatus ) {
			if ( importInterval ) {
				clearInterval( importInterval );
			}
			await clearImport( siteIdRef.current!, importIdRef.current! );
			setImportStatus( __( 'Import failed, please reload this page to try again.' ) );
		}
	};

	useEffect( () => {
		if ( ! importIdRef.current ) {
			return;
		}
		if ( ! siteIdRef.current ) {
			return;
		}
		setImportInterval( setInterval( checkImportStatus, 5000 ) );
		return () => {
			if ( importInterval ) {
				clearInterval( importInterval );
			}
		};
	}, [ importIdRef.current, siteIdRef.current ] );

	const shouldHideBackButton = () => {
		return true;
	};

	const shouldHideSkip = () => {
		return true;
	};

	const startImport = async ( client: PlaygroundClient ) => {
		if ( ! siteIdRef.current ) {
			const site = await wp.req.get( `/sites/${ siteSlug }` );
			if ( ! site ) {
				setImportStatus( __( 'No site slug provided.' ) );
				return;
			}
			siteIdRef.current = site.ID;
		}

		if ( ! client ) {
			setImportStatus( __( 'Import failed, please reload this page to try again.' ) );
			return;
		}
		setImportStatus( 'Preparing Playground for import' );
		const importId = await importPlaygroundSite( client, siteIdRef.current! );
		if ( importId ) {
			setImportStatus( 'Uploading Site to WordPress.com' );
			importIdRef.current = importId;
		} else {
			setImportStatus( __( 'Import failed, please reload this page to try again.' ) );
		}
	};

	const getStepContent = () => {
		return (
			<>
				<Loading title={ importStatus } />
				<PlaygroundIframe
					className="playground__onboarding-iframe"
					playgroundClient={ playgroundClientRef.current }
					setPlaygroundClient={ startImport }
				/>
			</>
		);
	};

	return (
		<>
			<DocumentHead title={ __( 'Playground Setup' ) } />
			<StepWrapper
				hideBack={ shouldHideBackButton() }
				hideSkip={ shouldHideSkip() }
				stepContent={ getStepContent() }
			/>
		</>
	);
};

export default PlaygroundSetupStep;
