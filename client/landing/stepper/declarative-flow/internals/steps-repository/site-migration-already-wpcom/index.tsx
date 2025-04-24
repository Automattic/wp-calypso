import { Step, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2MigrationFlow } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Form from './components/form';
import type { Step as StepType } from '../../types';
import './style.scss';

const extractDomainFromUrl = ( url: string ) => {
	try {
		const parsedUrl = new URL( url );
		return parsedUrl.hostname;
	} catch ( error ) {
		return url;
	}
};

const SiteMigrationAlreadyWPCOM: StepType = ( { stepName, flow, navigation } ) => {
	const translate = useTranslate();
	const [ query ] = useSearchParams();
	const from = query.get( 'from' )!;

	const title = translate( 'Your site is already on {{break}}WordPress.com{{/break}}', {
		components: {
			break: <span style={ { display: 'block' } } />,
		},
	} );

	const subHeaderText = translate(
		"Let's figure out your next steps for {{strong}}%(from)s{{/strong}} together. Please complete the form below.",
		{
			args: {
				from: extractDomainFromUrl( from ),
			},
			components: {
				strong: <strong />,
			},
		}
	);

	const onSubmit = () => {
		navigation?.submit?.();
	};

	if ( shouldUseStepContainerV2MigrationFlow( flow ) ) {
		return (
			<>
				<DocumentHead title={ translate( 'Your site is already on WordPress.com' ) } />
				<Step.CenteredColumnLayout
					columnWidth={ 8 }
					topBar={
						<Step.TopBar leftElement={ <Step.BackButton onClick={ navigation.goBack } /> } />
					}
					heading={ <Step.Heading text={ title } subText={ subHeaderText } /> }
				>
					<Form onComplete={ onSubmit } />
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Your site is already on WordPress.com' ) } />
			<StepContainer
				stepName={ stepName }
				flowName={ flow }
				hideSkip
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				formattedHeader={
					<FormattedHeader
						subHeaderAs="div"
						headerText={ title }
						subHeaderText={ subHeaderText }
						align="center"
					/>
				}
				isFullLayout
				stepContent={ <Form onComplete={ onSubmit } /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationAlreadyWPCOM;
