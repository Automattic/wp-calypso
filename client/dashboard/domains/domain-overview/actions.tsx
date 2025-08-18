import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainQuery } from '../../app/queries/domain';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { domainRoute } from '../../app/router';
import { ActionList } from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';
import { getDomainRenewalUrl } from '../../utils/domain';

export default function Actions() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: purchase } = useQuery(
		sitePurchaseQuery( domain.blog_id, parseInt( domain.subscription_id, 10 ) )
	);

	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 3 } title={ __( 'Actions' ) } />
			<ActionList>
				{ purchase?.is_renewable && (
					<ActionList.ActionItem
						title={ __( 'Renew' ) }
						description={ __( 'Renew domain registration.' ) }
						actions={
							<Button variant="secondary" href={ getDomainRenewalUrl( domain, purchase ) }>
								{ __( 'Renew' ) }
							</Button>
						}
					/>
				) }
				<ActionList.ActionItem
					title={ __( 'Transfer' ) }
					description={ __( 'Transfer this domain to another site or WordPress.com user.' ) }
					actions={ <Button variant="secondary">{ __( 'Transfer' ) }</Button> }
				/>
				<ActionList.ActionItem
					title={ __( 'Detach' ) }
					description={ __( 'Detach this domain from the site.' ) }
					actions={ <Button variant="secondary">{ __( 'Detach' ) }</Button> }
				/>
				<ActionList.ActionItem
					title={ __( 'Delete' ) }
					description={ __( 'Remove this domain permanently.' ) }
					actions={
						<Button variant="secondary" isDestructive>
							{ __( 'Delete' ) }
						</Button>
					}
				/>
			</ActionList>
		</VStack>
	);
}
