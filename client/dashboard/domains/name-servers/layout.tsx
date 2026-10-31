import { useHasEnTranslation } from '@automattic/i18n-utils';
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
	const hasEnTranslation = useHasEnTranslation();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					description={ createInterpolateElement(
						hasEnTranslation(
							'Name servers tell the internet where to find this domain name’s site and email. <learnMoreLink />'
						)
							? __(
									'Name servers tell the internet where to find this domain name’s site and email. <learnMoreLink />'
								)
							: __( 'Change the name servers for your domain. <learnMoreLink />' ),
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
