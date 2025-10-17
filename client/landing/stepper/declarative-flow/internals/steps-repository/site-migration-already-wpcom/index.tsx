import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
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

const SiteMigrationAlreadyWPCOM: StepType = ( { navigation } ) => {
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

	return (
		<>
			<DocumentHead title={ translate( 'Your site is already on WordPress.com' ) } />
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={ <Step.Heading text={ title } subText={ subHeaderText } /> }
			>
				<Form onComplete={ onSubmit } />
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationAlreadyWPCOM;
