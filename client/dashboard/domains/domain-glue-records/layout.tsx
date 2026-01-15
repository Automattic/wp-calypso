import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainGlueRecordsAddRoute, domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';

export const DomainGlueRecordsLayout = ( {
	children,
	isCtaDisabled,
	notices,
}: {
	children?: React.ReactNode;
	isCtaDisabled?: boolean;
	notices?: React.ReactNode;
} ) => {
	const { domainName } = domainRoute.useParams();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ createInterpolateElement(
						__( 'Edit your private name server records. <learnMoreLink />' ),
						{
							learnMoreLink: <InlineSupportLink supportContext="domain-glue-records" />,
						}
					) }
					actions={
						<RouterLinkButton
							to={ domainGlueRecordsAddRoute.fullPath }
							params={ { domainName } }
							variant="primary"
							__next40pxDefaultSize
							disabled={ isCtaDisabled }
						>
							{ __( 'Add glue record' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={ notices }
		>
			{ children }
		</PageLayout>
	);
};
