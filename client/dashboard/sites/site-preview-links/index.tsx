import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	sitePreviewLinksQuery,
	sitePreviewLinkCreateMutation,
	sitePreviewLinkDeleteMutation,
} from '../../app/queries/site-preview-links';
import { SectionHeader } from '../../components/section-header';
import SitePreviewLink from '../../components/site-preview-link';
import { DotcomFeatures } from '../../data/constants';
import { hasPlanFeature } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Field } from '@automattic/dataviews';

interface SitePreviewLinkProps {
	site: Site;
	title?: string;
	description?: string;
}

export default function SitePreviewLinks( { site, title, description }: SitePreviewLinkProps ) {
	const { data: links = [] } = useQuery( sitePreviewLinksQuery( site.ID ) );
	const createMutation = useMutation( sitePreviewLinkCreateMutation( site.ID ) );
	const deleteMutation = useMutation( sitePreviewLinkDeleteMutation( site.ID ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	if ( ! hasPlanFeature( site, DotcomFeatures.SITE_PREVIEW_LINKS ) ) {
		return null;
	}

	const handleChange = ( { enabled }: { enabled?: boolean } ) => {
		if ( enabled ) {
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

	const handleCopy = () => {
		createSuccessNotice( __( 'Copied the share link to clipboard.' ), {
			type: 'snackbar',
		} );
	};

	const renderContent = () => {
		const isMutationPending = createMutation.isPending || deleteMutation.isPending;

		const fields: Field< { enabled: boolean } >[] = [
			{
				id: 'enabled',
				label: 'Enable share link',
				Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
					const { id, label, getValue } = field;
					return (
						<ToggleControl
							__nextHasNoMarginBottom
							label={ hideLabelFromVision ? '' : label }
							checked={ getValue( { item: data } ) }
							disabled={ isMutationPending }
							onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
						/>
					);
				},
			},
		];

		const form = {
			type: 'regular' as const,
			fields: [ 'enabled' ],
		};

		const data = { enabled: links.length > 0 };

		return (
			<form>
				<VStack spacing={ 4 }>
					<DataForm< { enabled: boolean } >
						data={ data }
						fields={ fields }
						form={ form }
						onChange={ handleChange }
					/>
					{ links?.map( ( link ) => (
						<SitePreviewLink
							key={ link.code }
							label={ __( 'share link' ) }
							hideLabelFromVision
							{ ...link }
							siteUrl={ site.URL }
							disabled={ isMutationPending }
							onCopy={ handleCopy }
						/>
					) ) }
				</VStack>
			</form>
		);
	};

	if ( title && description ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 3 }>
						<SectionHeader level={ 3 } title={ title } description={ description } />
						{ renderContent() }
					</VStack>
				</CardBody>
			</Card>
		);
	}
	return renderContent();
}
