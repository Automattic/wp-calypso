import { STATIC_SITE_IMPORT_TERMINAL_STATES } from '@automattic/api-core';
import {
	isPermanentStaticSiteImportError,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/dashboard/components/notice';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { ImportCard, useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

export type StaticSiteImportBuildingSubmits = { state: 'finished' | 'failed' };

const StaticSiteImportBuilding: StepType< { submits: StaticSiteImportBuildingSubmits } > =
	function StaticSiteImportBuilding( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { platformName } = useStaticSiteImportSource();
		const email = useSelector( getCurrentUserEmail );

		// A transient request failure keeps polling; a 4xx means the session is gone.
		const { data: session, error } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
			refetchInterval: pollStaticSiteImportSessionUntil( STATIC_SITE_IMPORT_TERMINAL_STATES ),
		} );

		const hasSubmitted = useRef( false );
		useEffect( () => {
			if ( hasSubmitted.current ) {
				return;
			}
			if (
				! sessionId ||
				session?.state === 'failed' ||
				isPermanentStaticSiteImportError( error )
			) {
				hasSubmitted.current = true;
				navigation.submit?.( { state: 'failed' } );
			} else if ( session?.state === 'finished' ) {
				hasSubmitted.current = true;
				navigation.submit?.( { state: 'finished' } );
			}
		}, [ error, navigation, session?.state, sessionId ] );

		return (
			<>
				<DocumentHead title={ __( 'We’re building your site' ) } />
				<Step.CenteredColumnLayout
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
					<ImportCard title={ __( 'Move in progress' ) }>
						<Notice variant="info">
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
						</Notice>
						{ email && (
							<Text variant="muted">
								{ sprintf(
									/* translators: %s: the user's email address. */
									__( 'We’ll email %s as soon as it’s done.' ),
									email
								) }
							</Text>
						) }
					</ImportCard>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportBuilding;
