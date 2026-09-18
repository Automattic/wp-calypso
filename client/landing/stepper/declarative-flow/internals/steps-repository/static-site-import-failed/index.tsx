import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/dashboard/components/notice';
import {
	ImportCard,
	useStaticSiteImportSource,
	useStaticSiteImportTicket,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

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
			// Shown by the error notice.
		}
	};

	return (
		<>
			<DocumentHead title={ __( 'We couldn’t finish your move' ) } />
			<Step.CenteredColumnLayout
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
				<ImportCard title={ __( 'Move failed' ) }>
					<Notice variant="error">
						{ __(
							'Something went wrong while rebuilding your site. We’ve logged the details so the team can fix it.'
						) }
					</Notice>
					<Heading level={ 3 } size={ 16 } weight={ 600 }>
						{ __( 'What happens now' ) }
					</Heading>
					<Text>
						{ __(
							'Our migrations team has the details and will email you about what got in the way. Your plan stays active. If you’d rather not wait, you can talk to someone now.'
						) }
					</Text>
					{ isError && (
						<Notice variant="error">
							{ __( 'We couldn’t reach the team just now. Please try again.' ) }
						</Notice>
					) }
					<div>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ isPending }
							disabled={ isPending }
							onClick={ onTalkToExpert }
						>
							{ __( 'Talk to a migration expert' ) }
						</Button>
					</div>
				</ImportCard>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportFailed;
