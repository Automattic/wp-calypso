import { __ } from '@wordpress/i18n';
import { ReactElement } from 'react';
import Card from '../card';
import InfoLabel from '../info-label';

type DomainEligibilityWarningProps = {
	wpcomDomain: string | null;
	stagingDomain: string | null;
};

const DomainEligibilityWarning = ( {
	wpcomDomain,
	stagingDomain,
}: DomainEligibilityWarningProps ): ReactElement => (
	<Card title={ __( 'New Store Domain' ) }>
		<InfoLabel label={ __( 'New' ) }>{ stagingDomain }</InfoLabel>
		<p>
			{ `By installing this product your subdomain will change. Your old subdomain (${ wpcomDomain }) will no longer work. You can change it to a custom domain on us at anytime in future.` }
		</p>
	</Card>
);

export default DomainEligibilityWarning;
