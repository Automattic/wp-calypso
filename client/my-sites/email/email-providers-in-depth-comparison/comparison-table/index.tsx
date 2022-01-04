import { FunctionComponent } from 'react';
import type {
	ComparisonTableProps,
	EmailProviderFeatures,
} from 'calypso/my-sites/email/email-providers-in-depth-comparison/types';

const ComparisonTable: FunctionComponent< ComparisonTableProps > = ( { emailProviders } ) => {
	return emailProviders.map( ( emailProviderFeatures: EmailProviderFeatures, index: number ) => {
		return (
			<div key={ index }>
				{ emailProviderFeatures.logo }

				<h2>{ emailProviderFeatures.header }</h2>
			</div>
		);
	} );
};

export default ComparisonTable;
