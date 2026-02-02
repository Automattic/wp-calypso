import { useRouter } from '@tanstack/react-router';
import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { siteRoute } from '../app/router/sites';
import { getDomainConnectionSetupTemplateUrl } from '../utils/domain-url';
import { getCurrentDashboard, wpcomLink } from '../utils/link';

export default function AddDomainButton() {
	const router = useRouter();
	const { siteSlug } = router.matchRoute( siteRoute.fullPath );

	const buildQueryArgs = () => {
		const queryArgs: Record< string, string > = {};

		if ( siteSlug ) {
			queryArgs.siteSlug = siteSlug;
			queryArgs.domainConnectionSetupUrl = getDomainConnectionSetupTemplateUrl();
		}

		queryArgs.dashboard = getCurrentDashboard();

		return queryArgs;
	};

	const navigateTo = ( urlWithSite: string, urlWithoutSite: string ) => {
		const queryArgs = buildQueryArgs();
		window.location.href = addQueryArgs( siteSlug ? urlWithSite : urlWithoutSite, queryArgs );
		return false;
	};

	const onSearchClick = () =>
		navigateTo( wpcomLink( '/setup/domain' ), wpcomLink( '/start/domain' ) );

	const onTransferOrConnectClick = () =>
		navigateTo( wpcomLink( '/setup/domain/use-my-domain' ), wpcomLink( '/setup/domain-transfer' ) );

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
						{ siteSlug ? __( 'Use a domain name I own' ) : __( 'Transfer domain name' ) }
					</MenuItem>
				</>
			) }
		/>
	);
}
