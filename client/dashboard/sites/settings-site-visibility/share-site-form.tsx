import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { SectionHeader } from '../../components/section-header';
import { useSiteIsPreview } from '../site-fields/plan-awaiting-checkout';
import SitePreviewLinks from '../site-preview-links';
import type { Site } from '@automattic/api-core';

// A preview stays Coming Soon until it is bought, so its share link is how anyone sees it. The
// server gives that link once the preview is built and keeps it for as long as the preview stands.
function PreviewShareLink( { shareUrl }: { shareUrl: string } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Share site' ) }
						description={ __(
							'Visitors see a Coming Soon page. Share this link so anyone can view your site.'
						) }
					/>
					<ClipboardInputControl
						label={ __( 'Share link' ) }
						hideLabelFromVision
						value={ shareUrl }
						readOnly
						onCopy={ () =>
							createSuccessNotice( __( 'Copied the share link to clipboard.' ), {
								type: 'snackbar',
							} )
						}
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}

export function ShareSiteForm( { site }: { site: Site } ) {
	const { isLoading, isPreview, shareUrl } = useSiteIsPreview( site );

	if ( isLoading ) {
		return null;
	}

	if ( isPreview ) {
		return shareUrl ? <PreviewShareLink shareUrl={ shareUrl } /> : null;
	}

	return (
		<SitePreviewLinks
			site={ site }
			title={ __( 'Share site' ) }
			description={ __( 'Give collaborators without an account access to view your site.' ) }
		/>
	);
}
