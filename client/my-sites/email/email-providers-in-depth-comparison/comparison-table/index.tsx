/* eslint-disable wpcalypso/jsx-classname-namespace */

import { FunctionComponent } from 'react';
import type {
	ComparisonTableProps,
	EmailProviderFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';

const ComparisonTable: FunctionComponent< ComparisonTableProps > = ( { emailProviders } ) => {
	return (
		<div className="email-providers-in-depth-comparison-table">
			{ emailProviders.map( ( emailProviderFeatures: EmailProviderFeatures, index: number ) => {
				return (
					<div key={ index }>
						<div className="email-providers-in-depth-comparison-table__provider-name">
							{ emailProviderFeatures.logo }

							<h2>{ emailProviderFeatures.name }</h2>
						</div>
					</div>
				);
			} ) }
		</div>
	);
};

export default ComparisonTable;
