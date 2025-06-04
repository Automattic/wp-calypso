import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	sitePreviewLinksQuery,
	sitePreviewLinkCreateMutation,
	sitePreviewLinkDeleteMutation,
} from '../../app/queries/site-preview-links';
import SitePreviewLink from '../../components/site-preview-link';
import { DotcomFeatures } from '../../data/constants';
import { hasPlanFeature } from '../../utils/site-features';
import type { Site } from '../../data/types';

interface SitePreviewLinkProps {
	site: Site;
	title?: string;
}

export default function SitePreviewLinks( { site, title }: SitePreviewLinkProps ) {
	const { data: links = [] } = useQuery( sitePreviewLinksQuery( site.ID ) );
	const createMutation = useMutation( sitePreviewLinkCreateMutation( site.ID ) );
	const deleteMutation = useMutation( sitePreviewLinkDeleteMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	if ( ! hasPlanFeature( site, DotcomFeatures.SITE_PREVIEW_LINKS ) ) {
		return null;
	}

	const handleChange = ( checked: boolean ) => {
		if ( checked ) {
			createMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Preview link enabled.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to enable preview link.' ), { type: 'snackbar' } );
				},
			} );
		} else {
			links?.forEach( ( { code } ) => {
				deleteMutation.mutate( code, {
					onSuccess: () => {
						createSuccessNotice( __( 'Preview link disabled.' ), { type: 'snackbar' } );
					},
					onError: () => {
						createErrorNotice( __( 'Failed to disable preview link.' ), { type: 'snackbar' } );
					},
				} );
			} );
		}
	};

	const renderContent = () => {
		const isMutationPending = createMutation.isPending || deleteMutation.isPending;
		return (
			<>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __(
						'Enable "Share site" to let collaborators without an account view your site.'
					) }
					checked={ links.length > 0 }
					disabled={ isMutationPending }
					onChange={ handleChange }
				/>
				{ links?.map( ( link ) => (
					<SitePreviewLink
						key={ link.code }
						{ ...link }
						siteUrl={ site.URL }
						disabled={ isMutationPending }
					/>
				) ) }
			</>
		);
	};

	if ( title ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text size="15px" weight={ 500 } lineHeight="20px">
							{ title }
						</Text>
						{ renderContent() }
					</VStack>
				</CardBody>
			</Card>
		);
	}
	return renderContent();
}
