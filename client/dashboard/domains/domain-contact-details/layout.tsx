import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { ReactNode } from 'react';

interface ContactDetailsLayoutProps {
	children: ReactNode;
	notices?: ReactNode;
	isCtaDisabled?: boolean;
}

export function ContactDetailsLayout( {
	children,
	notices,
	isCtaDisabled = false,
}: ContactDetailsLayoutProps ) {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Contact details & privacy' ) }
					prefix={ <Breadcrumbs length={ 3 } /> }
				/>
			}
		>
			<VStack spacing={ 8 }>
				{ notices }
				{ children }
			</VStack>
		</PageLayout>
	);
}
