/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import { emailManagementPurchaseNewEmailAccount } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type {
	ComparisonTableProps,
	EmailProviderFeatures,
} from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';
import type { ReactElement } from 'react';

const ComparisonTable = ( {
	emailProviders,
	intervalLength,
	selectedDomainName,
}: ComparisonTableProps ): ReactElement => {
	const translate = useTranslate();

	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const currentRoute = useSelector( getCurrentRoute );

	const selectEmailProvider = ( emailProviderSlug: string ) => {
		if ( selectedSiteSlug === null ) {
			return;
		}

		page(
			emailManagementPurchaseNewEmailAccount(
				selectedSiteSlug,
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
