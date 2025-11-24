import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';

export function AddDomainButton( {
	siteSlug,
	domainConnectionSetupUrl,
}: {
	siteSlug?: string;
	domainConnectionSetupUrl?: string;
} ) {
	const buildQueryArgs = () => {
		const queryArgs: Record< string, string > = {};
		if ( siteSlug ) {
			queryArgs.siteSlug = siteSlug;
		}
		if ( domainConnectionSetupUrl ) {
			queryArgs.domainConnectionSetupUrl = domainConnectionSetupUrl;
		}
		return queryArgs;
	};

	const navigateTo = ( urlWithSite: string, urlWithoutSite: string ) => {
		const queryArgs = buildQueryArgs();
		window.location.href = siteSlug ? addQueryArgs( urlWithSite, queryArgs ) : urlWithoutSite;
		return false;
	};

	const onSearchClick = () => navigateTo( '/setup/domain', '/start/domain' );

	const onTransferOrConnectClick = () =>
		navigateTo( '/setup/domain/use-my-domain', '/setup/domain-transfer' );

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
