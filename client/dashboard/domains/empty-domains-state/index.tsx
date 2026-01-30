import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search, globe } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import { wpcomLink } from '../../utils/link';
import type { ReactNode } from 'react';

export default function EmptyDomainsState( {
	title,
	description,
	isBorderless,
	children,
}: {
	title: string;
	description: ReactNode;
	isBorderless?: boolean;
	children?: ReactNode;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_domains_dashboard_empty_state_action_click', {
			action,
		} );
	};

	const handleSearchDomainsClick = () => {
		trackEmptyStateActionClick( 'search-domains' );
	};

	const handleTransferDomainClick = () => {
		trackEmptyStateActionClick( 'transfer-domain' );
	};

	return (
		<EmptyState.Wrapper isBorderless={ isBorderless }>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ title }</EmptyState.Title>
					<EmptyState.Description>{ description }</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Search domain names' ) }
							description={ __( 'Find and register the perfect domain for your brand.' ) }
							decoration={ <Icon icon={ search } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ wpcomLink( '/start/domain' ) }
									onClick={ handleSearchDomainsClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Search domains' ) }
								</Button>
							}
						/>
						<EmptyState.ActionItem
							title={ __( 'Transfer a domain you already own' ) }
							description={ __(
								'Move your domain to WordPress.com and manage everything in one place.'
							) }
							decoration={ <Icon icon={ globe } size={ 24 } /> }
							actions={
								<Button
									variant="secondary"
									href={ wpcomLink( '/setup/domain-transfer' ) }
									onClick={ handleTransferDomainClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Start transfer' ) }
								</Button>
							}
						/>
					</EmptyState.ActionList>
					{ children }
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
