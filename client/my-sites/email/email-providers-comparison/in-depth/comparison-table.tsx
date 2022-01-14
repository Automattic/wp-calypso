/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { getSelectedDomain } from 'calypso/lib/domains';
import GoogleWorkspacePrice from 'calypso/my-sites/email/email-providers-comparison/price/google-workspace';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type {
	ComparisonTableProps,
	ComparisonTablePriceProps,
	EmailProviderFeatures,
} from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

const ComparisonTablePrice = ( {
	domain,
	emailProviderSlug,
	intervalLength,
}: ComparisonTablePriceProps ): ReactElement => {
	if ( emailProviderSlug === 'google-workspace' ) {
		return <GoogleWorkspacePrice intervalLength={ intervalLength } />;
	}

	return <ProfessionalEmailPrice domain={ domain } intervalLength={ intervalLength } />;
};

const ComparisonTable = ( {
	emailProviders,
	intervalLength,
	selectedDomainName,
}: ComparisonTableProps ): ReactElement => {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );

	const selectEmailProvider = ( emailProviderSlug: string ) => {
		if ( selectedSite === null ) {
			return;
		}

		page(
			emailManagementPurchaseNewEmailAccount(
				selectedSite.slug,
				selectedDomainName,
				currentRoute,
				null,
				emailProviderSlug,
				intervalLength
			)
		);
	};

	return (
		<div className="email-providers-in-depth-comparison-table">
			{ emailProviders.map( ( emailProviderFeatures: EmailProviderFeatures ) => {
				return (
					<div key={ emailProviderFeatures.slug }>
						<div className="email-providers-in-depth-comparison-table__provider-name">
							{ emailProviderFeatures.logo }

							<h2>{ emailProviderFeatures.name }</h2>
						</div>

						<ComparisonTablePrice
							domain={ domain }
							emailProviderSlug={ emailProviderFeatures.slug }
							intervalLength={ intervalLength }
						/>

						<Button onClick={ () => selectEmailProvider( emailProviderFeatures.slug ) } primary>
							{ translate( 'Select' ) }
						</Button>
					</div>
				);
			} ) }
		</div>
	);
};

export default ComparisonTable;
