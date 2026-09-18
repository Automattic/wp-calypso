import { STATIC_SITE_IMPORT_TERMINAL_STATES } from '@automattic/api-core';
import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import {
	Panel,
	StatusNotice,
	useStaticSiteImportSource,
	useUserEmail,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import '../components/static-site-import/style.scss';

export const POLL_INTERVAL = 10000;

export type StaticSiteImportBuildingSubmits = { state: 'finished' | 'failed' };

const StaticSiteImportBuilding: StepType< { submits: StaticSiteImportBuildingSubmits } > =
	function StaticSiteImportBuilding( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { platformName } = useStaticSiteImportSource();
		const email = useUserEmail();

		const { data: session, isError } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
			refetchInterval: ( query ) => {
				const state = query.state.data?.state;
				return state && STATIC_SITE_IMPORT_TERMINAL_STATES.includes( state )
					? false
					: POLL_INTERVAL;
			},
		} );

		const hasSubmitted = useRef( false );
		useEffect( () => {
			if ( hasSubmitted.current ) {
				return;
			}
			if ( ! sessionId || isError || session?.state === 'failed' ) {
				hasSubmitted.current = true;
				navigation.submit?.( { state: 'failed' } );
			} else if ( session?.state === 'finished' ) {
				hasSubmitted.current = true;
				navigation.submit?.( { state: 'finished' } );
			}
		}, [ isError, navigation, session?.state, sessionId ] );

		return (
			<>
				<DocumentHead title={ __( 'We’re building your site' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--static-site-import-building"
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'We’re building your site' ) }
							subText={ __(
								'This can take a while. You can close this page, and we’ll email you when it’s ready.'
							) }
						/>
					}
				>
					<Panel title={ __( 'Move in progress' ) }>
						<StatusNotice status="info">
							{ platformName
								? sprintf(
										/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
										__(
											'We’re rebuilding your pages on WordPress.com. Your %s site stays live and unchanged.'
										),
										platformName
								  )
								: __(
										'We’re rebuilding your pages on WordPress.com. Your current site stays live and unchanged.'
								  ) }
						</StatusNotice>
						{ email && (
							<p className="static-site-import__muted">
								{ sprintf(
									/* translators: %s: the user's email address. */
									__( 'We’ll email %s as soon as it’s done.' ),
									email
								) }
							</p>
						) }
					</Panel>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportBuilding;
