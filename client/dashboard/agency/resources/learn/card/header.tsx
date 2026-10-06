import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Text } from '../../../../components/text';
import { getContentTypeLabel } from '../lib/labels';
import ResourceProductLogo from '../resource-product-logo';
import ResourceIllustration from './illustration';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface ResourceCardHeaderProps {
	resource: AgencyEnablementResource;
	title: ReactNode;
}

/**
 * The branded top of a resource card. Colors come from `data-product` in
 * style.scss, so a new product only needs a palette entry there.
 */
export default function ResourceCardHeader( { resource, title }: ResourceCardHeaderProps ) {
	return (
		<div className="dashboard-resources-learn__card-header" data-product={ resource.product }>
			<ResourceIllustration resource={ resource } />
			<VStack
				spacing={ 2 }
				alignment="flex-start"
				expanded={ false }
				className="dashboard-resources-learn__card-label"
			>
				<Text
					className="dashboard-resources-learn__card-eyebrow"
					color="inherit"
					size={ 10 }
					weight={ 600 }
					lineHeight="16px"
					upperCase
				>
					{ getContentTypeLabel( resource.content_type ) }
				</Text>
				{ resource.is_featured && (
					<Badge className="dashboard-resources-learn__top-badge">{ __( 'Top resource' ) }</Badge>
				) }
			</VStack>
			<Heading level={ 3 } color="inherit" className="dashboard-resources-learn__card-title">
				{ title }
			</Heading>
			<div className="dashboard-resources-learn__card-brand">
				<ResourceProductLogo product={ resource.product } />
			</div>
		</div>
	);
}
