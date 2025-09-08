import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import deleteStagingSiteIllustration from '../../sites/staging-site/components/staging-site-transfer-banner/delete-staging-site-illustration.svg';
import { Callout } from '../components/callout';
import { getProductionSiteId } from '../utils/site-staging-site';
import type { Site } from '@automattic/api-core';

export function StagingSiteDeletionCallout( { site }: { site: Site } ) {
	const navigate = useNavigate();
	const productionSiteId = Number( getProductionSiteId( site ) );
	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const handleViewProductionSite = () => {
		if ( productionSite?.slug ) {
			navigate( {
				to: '/sites/$siteSlug',
				params: { siteSlug: productionSite.slug },
			} );
		}
	};

	return (
		<Callout
			title={ __( 'Deleting staging site' ) }
			image={ deleteStagingSiteIllustration }
			imageAlt={ __( 'Deleting staging site illustration' ) }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							"We're permanently deleting your staging site. Your live site is safe and won't be affected."
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Hang tight, this may take a few moments.' ) }
					</Text>
				</>
			}
			actions={
				productionSite && (
					<Button variant="primary" __next40pxDefaultSize onClick={ handleViewProductionSite }>
						{ __( 'Go to production site' ) }
					</Button>
				)
			}
		/>
	);
}
