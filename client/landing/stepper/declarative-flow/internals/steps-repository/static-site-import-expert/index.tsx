import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import {
	ImportCard,
	SourceCard,
	useStaticSiteImportSource,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

export type StaticSiteImportExpertSubmits = { action: 'continue-alone'; finished: boolean };

const StaticSiteImportExpert: StepType< { submits: StaticSiteImportExpertSubmits } > =
	function StaticSiteImportExpert( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { host, platformName } = useStaticSiteImportSource();
		const email = useSelector( getCurrentUserEmail );
		const { data: session } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );

		const site = host || __( 'your site' );
		const handOff = email
			? sprintf(
					/* translators: %1$s: the site's domain, e.g. example.com. %2$s: the user's email address. */
					__(
						'We’ve passed %1$s to our migrations team, along with what we found. They’ll email %2$s to talk through your options.'
					),
					site,
					email
				)
			: sprintf(
					/* translators: %s: the site's domain, e.g. example.com. */
					__(
						'We’ve passed %s to our migrations team, along with what we found. They’ll email you to talk through your options.'
					),
					site
				);

		return (
			<>
				<DocumentHead title={ __( 'A migration expert will be in touch' ) } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'A migration expert will be in touch' ) }
							subText={
								platformName
									? sprintf(
											/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
											__( 'Nothing on your %s site changes.' ),
											platformName
										)
									: __( 'Nothing on your current site changes.' )
							}
						/>
					}
				>
					<VStack spacing={ 8 }>
						<SourceCard />
						<ImportCard title={ __( 'What happens now' ) }>
							<Text>{ handOff }</Text>
							<Text variant="muted">
								{ __( 'Changed your mind? You can still move the rest of your site yourself.' ) }
							</Text>
							<div>
								<Button
									__next40pxDefaultSize
									variant="secondary"
									onClick={ () =>
										navigation.submit?.( {
											action: 'continue-alone',
											finished: session?.state === 'finished',
										} )
									}
								>
									{ __( 'Continue on my own instead' ) }
								</Button>
							</div>
						</ImportCard>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportExpert;
