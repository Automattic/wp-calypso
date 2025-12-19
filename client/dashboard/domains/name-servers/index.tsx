import {
	domainQuery,
	domainNameServersQuery,
	domainNameServersMutation,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getDomainSiteSlug } from '../../utils/domain';
import NameServersForm from './form';
import { shouldShowUpsellNudge } from './utils';

export default function NameServers() {
	const { user } = useAuth();
	const { domainName } = domainRoute.useParams();
	const { recordTracksEvent } = useAnalytics();

	const {
		data: { nameServers, isUsingDefaultNameServers, defaultNameServers },
	} = useSuspenseQuery( domainNameServersQuery( domainName ) );

	const { mutate: updateNameServers, isPending: isUpdatingNameServers } = useMutation( {
		...domainNameServersMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'Name servers for %s updated successfully.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const showUpsellNudge = useMemo(
		() => shouldShowUpsellNudge( user, domain, site ),
		[ domain, site, user ]
	);

	const onSubmit = useCallback(
		( ns: string[] ) => {
			recordTracksEvent( 'calypso_dashboard_domain_name_servers_save', {
				domain: domainName,
				ns,
			} );

			updateNameServers( ns, {
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_domain_name_servers_save_success', {
						domain: domainName,
						ns,
					} );
				},
				onError: ( e: Error ) => {
					recordTracksEvent( 'calypso_dashboard_domain_name_servers_save_failure', {
						domain: domainName,
						ns,
						error_message: e.message,
					} );
				},
			} );
		},
		[ updateNameServers, domainName, recordTracksEvent ]
	);

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
		>
			<Card>
				<CardBody>
					<NameServersForm
						domainName={ domainName }
						domainSiteSlug={ getDomainSiteSlug( domain ) }
						nameServers={ nameServers }
						defaultNameServers={ defaultNameServers }
						isUsingDefaultNameServers={ isUsingDefaultNameServers }
						isBusy={ isUpdatingNameServers }
						showUpsellNudge={ showUpsellNudge }
						onSubmit={ onSubmit }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
