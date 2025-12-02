import { DotcomFeatures } from '@automattic/api-core';
import {
	sitePreviewLinksQuery,
	sitePreviewLinkCreateMutation,
	sitePreviewLinkDeleteMutation,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import SitePreviewLink from '../../components/site-preview-link';
import { hasPlanFeature } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

interface SitePreviewLinkProps {
	site: Site;
	title?: string;
	description?: string;
}

export default function SitePreviewLinks( { site, title, description }: SitePreviewLinkProps ) {
	const linksPermitted = hasPlanFeature( site, DotcomFeatures.SITE_PREVIEW_LINKS );

	const { data: links = [] } = useQuery( {
		...sitePreviewLinksQuery( site.ID ),
		enabled: linksPermitted,
	} );
	const createMutation = useMutation( {
		...sitePreviewLinkCreateMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Preview link enabled.' ),
				error: __( 'Failed to enable preview link.' ),
			},
		},
	} );
	const deleteMutation = useMutation( {
		...sitePreviewLinkDeleteMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Preview link disabled.' ),
				error: __( 'Failed to disable preview link.' ),
			},
		},
	} );
	const { createSuccessNotice } = useDispatch( noticesStore );

	if ( ! linksPermitted ) {
		return null;
	}

	const handleChange = ( { enabled }: { enabled?: boolean } ) => {
		if ( enabled ) {
			createMutation.mutate( undefined );
		} else {
			links.forEach( ( { code } ) => {
				deleteMutation.mutate( code );
			} );
		}
	};

	const handleCopy = () => {
		createSuccessNotice( __( 'Copied the preview link to clipboard.' ), {
			type: 'snackbar',
		} );
	};

	const renderContent = () => {
		const isMutationPending = createMutation.isPending || deleteMutation.isPending;

		const fields: Field< { enabled: boolean } >[] = [
			{
				id: 'enabled',
				label: __( 'Enable preview link' ),
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
			layout: { type: 'regular' as const },
			fields: [ 'enabled' ],
		};

		const data = { enabled: links.length > 0 };

		return (
			<>
				<VStack spacing={ 4 }>
					<DataForm< { enabled: boolean } >
						data={ data }
						fields={ fields }
						form={ form }
						onChange={ handleChange }
					/>
					{ links.map( ( link ) => (
						<SitePreviewLink
							key={ link.code }
							label={ __( 'Preview link' ) }
							hideLabelFromVision
							{ ...link }
							siteUrl={ site.URL }
							disabled={ isMutationPending }
							onCopy={ handleCopy }
						/>
					) ) }
				</VStack>
			</>
		);
	};

	if ( title && description ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ title } description={ description } />
						{ renderContent() }
					</VStack>
				</CardBody>
			</Card>
		);
	}
	return renderContent();
}
