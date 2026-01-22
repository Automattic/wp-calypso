import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { getCurrentDashboard, redirectToDashboardLink, wpcomLink } from '../utils/link';

export function AddDomainButton( {
	siteSlug,
	domainConnectionSetupUrl,
	redirectTo,
}: {
	siteSlug?: string;
	domainConnectionSetupUrl?: string;
	redirectTo?: string;
} ) {
	const buildQueryArgs = () => {
		const queryArgs: Record< string, string > = {};
		if ( siteSlug ) {
			queryArgs.siteSlug = siteSlug;
		}
		if ( domainConnectionSetupUrl ) {
			queryArgs.domainConnectionSetupUrl = domainConnectionSetupUrl;
		}
		if ( redirectTo ) {
			queryArgs.redirect_to = redirectTo;
		}

		const dashboard = getCurrentDashboard();
		if ( dashboard ) {
			queryArgs.dashboard = dashboard;
		}
		queryArgs.back_to = redirectToDashboardLink();
		return queryArgs;
	};

	const navigateTo = ( urlWithSite: string, urlWithoutSite: string ) => {
		const queryArgs = buildQueryArgs();
		window.location.href = siteSlug
			? addQueryArgs( urlWithSite, queryArgs )
			: addQueryArgs( urlWithoutSite, queryArgs );
		return false;
	};

	const onSearchClick = () =>
		navigateTo( wpcomLink( '/setup/domain' ), wpcomLink( '/start/domain' ) );

	const onTransferOrConnectClick = () =>
		navigateTo(
			wpcomLink( '/setup/domain/use-my-domain' ),
			wpcomLink( '/setup/domain/use-my-domain' )
		);

	return (
		<Dropdown
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ isOpen ? chevronUp : chevronDown }
					iconPosition="right"
					variant="primary"
					__next40pxDefaultSize
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					{ __( 'Add domain name' ) }
				</Button>
			) }
			renderContent={ () => (
				<>
					<MenuItem iconPosition="left" icon={ search } onClick={ onSearchClick }>
						{ __( 'Search domain names' ) }
					</MenuItem>
					<MenuItem iconPosition="left" icon={ globe } onClick={ onTransferOrConnectClick }>
						{ __( 'Use a domain name I own' ) }
					</MenuItem>
				</>
			) }
		/>
	);
}
