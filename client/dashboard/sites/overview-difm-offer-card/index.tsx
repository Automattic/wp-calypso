import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { getDifmOfferCopy, useDifmOffer } from '../../utils/difm-offer';
import DIFMUpsellCard from '../overview-difm-upsell-card';
import illustrationUrl from '../overview-difm-upsell-card/upsell-illustration.svg';
import type { Site } from '@automattic/api-core';

/**
 * Fills the DIFM slot in the site overview. A user in a treatment arm of the DIFM
 * offer experiment sees the offer; everyone else sees the existing DIFM upsell.
 */
export default function DIFMOfferCard( { site }: { site: Site } ) {
	const localeSlug = useLocale();
	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug: site.plan?.product_slug,
		siteCreatedAt: site.options?.created_at,
		localeSlug,
	} );
	const copy = isEligible && ! isLoading ? getDifmOfferCopy( variation ) : null;

	if ( ! copy ) {
		return <DIFMUpsellCard site={ site } />;
	}

	return (
		<Callout
			title={ copy.title }
			titleAs="h2"
			description={ <Text variant="muted">{ copy.description }</Text> }
			image={ illustrationUrl }
			imageAlt={ __( 'Responsive website design' ) }
			imageVariant="full-bleed"
			actions={
				<UpsellCTAButton
					text={ copy.ctaText }
					variant="secondary"
					upsellId="site-overview-difm-offer"
					upsellFeatureId="difm-offer"
					onClick={ () => {
						// The offer modal opens here in a follow-up.
					} }
				/>
			}
		/>
	);
}
