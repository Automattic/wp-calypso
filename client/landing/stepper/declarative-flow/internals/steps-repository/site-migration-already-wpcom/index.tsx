import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { type FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Form from './components/form';
import type { StepProps } from '../../types';

import './style.scss';

const extractDomainFromUrl = ( url: string ) => {
	try {
		const parsedUrl = new URL( url );
		return parsedUrl.hostname;
	} catch ( error ) {
		return url;
	}
};

const SiteMigrationAlreadyWPCOM: FC< StepProps > = ( { stepName, flow, navigation } ) => {
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
