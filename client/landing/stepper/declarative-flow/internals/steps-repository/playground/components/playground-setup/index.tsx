import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { PlaygroundClient } from '@wp-playground/client';
import { useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useIsPlaygroundEligible } from '../../../../../../hooks/use-is-playground-eligible';
import { importPlaygroundSite } from '../../lib/import-playground';
import { PlaygroundIframe } from '../playground-iframe';
import type { Step } from '../../../../types';
import './style.scss';

export const PlaygroundSetupStep: Step = ( props ) => {
	const { submit } = props.navigation;
	const isPlaygroundEligible = useIsPlaygroundEligible();
	if ( ! isPlaygroundEligible ) {
		window.location.assign( '/start' );
	}

	const { __ } = useI18n();
	const playgroundClientRef = useRef< PlaygroundClient | null >( null );

	// There's probably a better way to do this.
	const siteSlug = getQueryArg( window.location.href, 'siteSlug' )?.toString();
	const siteId = parseInt( getQueryArg( window.location.href, 'siteId' )?.toString() ?? '0' );

	const shouldHideBackButton = () => {
		return true;
	};

	const shouldHideSkip = () => {
		return true;
	};

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
		return (
			<>
				<Loading title={ __( 'Preparing your site for import' ) } />
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
