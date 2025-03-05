import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { PlaygroundClient } from '@wp-playground/client';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../../../hooks/use-is-playground-eligible';
import { getImportStatus, importPlaygroundSite } from '../../lib/import-playground';
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
	const importIdRef = useRef< string | null >( null );
	const [ importInterval, setImportInterval ] = useState< NodeJS.Timeout | null >( null );
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );

	const siteSlug = getQueryArg( window.location.href, 'siteSlug' )?.toString();

	const checkImportStatus = async () => {
		if ( ! importIdRef.current ) {
			return;
		}
		const importStatus = await getImportStatus( importIdRef.current! );
		setImportStatus( importStatus );
		if ( importStatus === 'completed' ) {
			if ( importInterval ) {
				clearInterval( importInterval );
			}
			window.location.replace( `/home/${ siteSlug }` );
		}
	};

	useEffect( () => {
		if ( ! importIdRef.current ) {
			return;
		}
		setImportInterval( setInterval( checkImportStatus, 1000 ) );
		return () => {
			if ( importInterval ) {
				clearInterval( importInterval );
			}
		};
	}, [ importIdRef.current ] );

	const shouldHideBackButton = () => {
		return true;
	};

	const shouldHideSkip = () => {
		return true;
	};

	const startImport = async ( client: PlaygroundClient ) => {
		if ( ! siteSlug ) {
			setImportStatus( __( 'No site slug provided.' ) );
			return;
		}

		if ( ! client ) {
			setImportStatus( __( 'Import failed, please reload this page to try again.' ) );
			return;
		}
		setImportStatus( 'Preparing Playground for import' );
		const importId = await importPlaygroundSite( client, siteSlug );
		if ( importId ) {
			setImportStatus( 'Import started' );
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
