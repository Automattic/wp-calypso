import { __, sprintf } from '@wordpress/i18n';
import Card from '../card';
import InfoLabel from '../info-label';

type DomainEligibilityWarningProps = {
	wpcomDomain: string | null;
	stagingDomain: string | null;
};

const DomainEligibilityWarning = ( {
	wpcomDomain,
	stagingDomain,
}: DomainEligibilityWarningProps ) => (
	<Card title={ __( 'Domain change required' ) }>
		<InfoLabel label={ __( 'New' ) }>{ stagingDomain }</InfoLabel>
		<p>
			{ sprintf(
				/* translators: %1$s is the current wordpress.com subdomain (e.g. myawesomeblog.wordpress.com), %2$s is the new staging subdomain that traffic will be redirected to. */
				__(
					'By installing this product your subdomain will change. Your old subdomain (%1$s) will redirect to your new subdomain (%2$s). You can change it to a custom domain at anytime in the future.'
				),
				wpcomDomain ?? '',
				stagingDomain ?? ''
			) }
		</p>
	</Card>
);

export default DomainEligibilityWarning;
