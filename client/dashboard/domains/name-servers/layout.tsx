import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { ReactNode } from 'react';

export function NameServersLayout( {
	children,
	notices,
}: {
	children?: ReactNode;
	notices?: ReactNode;
} ) {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					description={ createInterpolateElement(
						__( 'Change the name servers for your domain. <learnMoreLink />' ),
						{
							learnMoreLink: <InlineSupportLink supportContext="nameservers" />,
						}
					) }
					prefix={ <Breadcrumbs length={ 2 } /> }
				/>
			}
			notices={ notices }
		>
			{ children }
		</PageLayout>
	);
}
