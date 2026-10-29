import {
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import ResourceProductLogo from '../resource-product-logo';
import ResourceIllustration from './illustration';
import { useFitTitle } from './use-fit-title';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface ResourceCardHeaderProps {
	resource: AgencyEnablementResource;
	title: ReactNode;
	children?: ReactNode;
}

/**
 * The branded top of a resource card. Colors come from `data-product` in
 * style.scss, so a new product only needs a palette entry there.
 */
export default function ResourceCardHeader( {
	resource,
	title,
	children,
}: ResourceCardHeaderProps ) {
	const titleRef = useFitTitle< HTMLHeadingElement >( resource.name );

	return (
		<div
			className="dashboard-resources-learn__card-header"
			data-product={ resource.product }
			data-content-type={ resource.content_type ?? undefined }
		>
			<ResourceIllustration resource={ resource } />
			<VStack
				spacing={ 2 }
				alignment="flex-start"
				justify="flex-start"
				expanded={ false }
				className="dashboard-resources-learn__card-label"
			>
				<ResourceProductLogo product={ resource.product } />
				{ resource.is_featured && (
					<Badge className="dashboard-resources-learn__top-badge">{ __( 'Top resource' ) }</Badge>
				) }
			</VStack>
			<Heading
				ref={ titleRef }
				level={ 3 }
				color="inherit"
				className="dashboard-resources-learn__card-title"
			>
				{ title }
			</Heading>
			{ children }
		</div>
	);
}
