import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import {
	Panel,
	StatusNotice,
	useStaticSiteImportSource,
	useStaticSiteImportTicket,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import '../components/static-site-import/style.scss';
import './style.scss';

const StaticSiteImportFailed: StepType = function StaticSiteImportFailed( { navigation } ) {
	const { __ } = useI18n();
	const [ searchParams ] = useSearchParams();
	const sessionId = searchParams.get( 'importSessionId' ) ?? '';
	const { platformName } = useStaticSiteImportSource();
	const { sendTicket, isPending, isError } = useStaticSiteImportTicket();
	const { data: session } = useQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		enabled: Boolean( sessionId ),
	} );

	const onTalkToExpert = async () => {
		try {
			await sendTicket(
				`Static site import failed: ${ session?.receipt?.code ?? 'unknown' } (session ${
					sessionId || 'unknown'
				})`
			);
			navigation.submit?.();
		} catch {
			// The error notice below covers it.
		}
	};

	return (
		<>
			<DocumentHead title={ __( 'We couldn’t finish your move' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--static-site-import-failed"
				columnWidth={ 8 }
				topBar={ <Step.TopBar /> }
				heading={
					<Step.Heading
						text={ __( 'We couldn’t finish your move' ) }
						subText={
							platformName
								? sprintf(
										/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
										__( 'Your %s site is untouched and still live.' ),
										platformName
								  )
								: __( 'Your current site is untouched and still live.' )
						}
					/>
				}
			>
				<Panel title={ __( 'Move failed' ) }>
					<StatusNotice status="error">
						{ __(
							'Something went wrong while rebuilding your site. We’ve logged the details so the team can fix it.'
						) }
					</StatusNotice>
					<h3 className="static-site-import-failed__subtitle">{ __( 'What happens now' ) }</h3>
					<p>
						{ __(
							'Our migrations team has the details and will email you about what got in the way. Your plan stays active. If you’d rather not wait, you can talk to someone now.'
						) }
					</p>
					{ isError && (
						<StatusNotice status="error">
							{ __( 'We couldn’t reach the team just now. Please try again.' ) }
						</StatusNotice>
					) }
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isPending }
						disabled={ isPending }
						onClick={ onTalkToExpert }
					>
						{ __( 'Talk to a migration expert' ) }
					</Button>
				</Panel>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportFailed;
