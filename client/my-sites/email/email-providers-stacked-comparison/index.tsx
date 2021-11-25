import { TranslateResult, useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, ReactElement } from 'react';
import EmailProvidersStackedCard from './email-provider-stacked-card';
import { professionalEmailCard } from './provider-cards/professional-email-card';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	source: string;
};

export interface ProviderCard {
	additionalPriceInformation?: TranslateResult;
	badge?: ReactElement;
	buttonLabel?: TranslateResult;
	children?: ReactElement;
	description: TranslateResult;
	detailsExpanded: boolean;
	discount?: string;
	expandButtonLabel: TranslateResult;
	features: TranslateResult[];
	footerBadge?: ReactElement;
	formattedPrice: string;
	formFields: ReactElement;
	logo: ReactElement;
	onExpandedChange: ( providerKey: string, expanded: boolean ) => void;
	onButtonClick?: ( event: React.MouseEvent ) => void;
	productName: TranslateResult;
	providerKey: string;
	showExpandButton: boolean;
}

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = () => {
	const translate = useTranslate();
	const professionalEmail: ProviderCard = professionalEmailCard;

	return (
		<>
			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick and email solution' ) }
			</h1>

			<EmailProvidersStackedCard
				providerKey={ professionalEmail.providerKey }
				logo={ professionalEmail.logo }
				productName={ professionalEmail.productName }
				description={ professionalEmail.description }
				detailsExpanded={ professionalEmail.detailsExpanded }
				discount={ '$42' }
				additionalPriceInformation={ 'per mailbox' }
				onExpandedChange={ professionalEmail.onExpandedChange }
				formattedPrice={ professionalEmail.formattedPrice }
				formFields={ professionalEmail.formFields }
				showExpandButton={ professionalEmail.showExpandButton }
				expandButtonLabel={ professionalEmail.expandButtonLabel }
				features={ professionalEmail.features }
				footerBadge={ professionalEmail.badge }
			/>
		</>
	);
};

export default EmailProvidersStackedComparison;
