import { translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { InDepthComparison, ProviderComparison } from './in-depth-comparison';

type EmailProvidersInDepthComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	siteName: string;
	source: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const ProfessionalEmailComparisonObject: ProviderComparison = {
	header: <h1> Professional Email </h1>,
	tools: translate( 'Integrated email management, Inbox, calendar and contacts' ),
	storage: translate( '30 GB of Storage' ),
	importing: translate( 'One-click import of existing emails and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

const GoogleWorkspaceComparisonObject: ProviderComparison = {
	header: <h1> Google </h1>,
	tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Sliders and more' ),
	storage: translate( '30 GB of Storage' ),
	importing: translate( 'Easy to import' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

export const EmailProvidersInDepthComparison: FunctionComponent< EmailProvidersInDepthComparisonProps > = (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props
) => {
	return (
		<InDepthComparison
			comparisonObjects={ [ ProfessionalEmailComparisonObject, GoogleWorkspaceComparisonObject ] }
		/>
	);
};
