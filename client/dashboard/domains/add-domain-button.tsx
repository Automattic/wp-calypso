import { useRouter } from '@tanstack/react-router';
import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAppContext } from '../app/context';
import { siteRoute } from '../app/router/sites';
import { getDomainConnectionSetupTemplateUrl } from '../utils/domain-url';
import { getCurrentDashboard, wpcomLink } from '../utils/link';

function buildDomainQueryArgs( siteSlug?: string ) {
	const queryArgs: Record< string, string > = {};

	if ( siteSlug ) {
		queryArgs.siteSlug = siteSlug;
		queryArgs.domainConnectionSetupUrl = getDomainConnectionSetupTemplateUrl();
	}

	queryArgs.dashboard = getCurrentDashboard();

	return queryArgs;
}

function DomainOnlyAddDomainButton() {
	const router = useRouter();
	const { siteSlug } = router.matchRoute( siteRoute.fullPath );
	const queryArgs = buildDomainQueryArgs( siteSlug );

	const onSearchClick = () => {
		window.location.href = addQueryArgs(
			wpcomLink( siteSlug ? '/setup/domain' : '/start/domain' ),
			queryArgs
		);
	};

	const onTransferOrConnectClick = () => {
		window.location.href = addQueryArgs(
			wpcomLink( siteSlug ? '/setup/domain/use-my-domain' : '/setup/domain-transfer' ),
			queryArgs
		);
	};

	return (
		<AddDomainDropdown
			onSearchClick={ onSearchClick }
			onTransferOrConnectClick={ onTransferOrConnectClick }
			transferLabel={ siteSlug ? __( 'Use a domain name I own' ) : __( 'Transfer domain name' ) }
		/>
	);
}

function DefaultAddDomainButton() {
	const router = useRouter();
	const { siteSlug } = router.matchRoute( siteRoute.fullPath );
	const queryArgs = buildDomainQueryArgs( siteSlug );

	const onSearchClick = () => {
		window.location.href = addQueryArgs( wpcomLink( '/setup/domain' ), queryArgs );
	};

	const onTransferOrConnectClick = () => {
		window.location.href = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), queryArgs );
	};

	return (
		<AddDomainDropdown
			onSearchClick={ onSearchClick }
			onTransferOrConnectClick={ onTransferOrConnectClick }
			transferLabel={ __( 'Use a domain name I own' ) }
		/>
	);
}

function AddDomainDropdown( {
	onSearchClick,
	onTransferOrConnectClick,
	transferLabel,
}: {
	onSearchClick: () => void;
	onTransferOrConnectClick: () => void;
	transferLabel: string;
} ) {
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
						{ transferLabel }
					</MenuItem>
				</>
			) }
		/>
	);
}

export default function AddDomainButton() {
	const { supports } = useAppContext();

	if ( supports.domainOnlySites ) {
		return <DomainOnlyAddDomainButton />;
	}

	return <DefaultAddDomainButton />;
}
