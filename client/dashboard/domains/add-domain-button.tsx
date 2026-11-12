import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useRouter } from '@tanstack/react-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../app/analytics';
import { useAppContext } from '../app/context';
import { siteRoute } from '../app/router/sites';
import { getCurrentDashboard } from '../app/routing';
import { getDomainConnectionSetupTemplateUrl } from '../utils/domain-url';
import { redirectToDashboardLink, wpcomLink } from '../utils/link';

function buildDomainQueryArgs( siteSlug?: string ) {
	const queryArgs: Record< string, string > = {};

	if ( siteSlug ) {
		queryArgs.siteSlug = siteSlug;
		const domainConnectionSetupUrl = getDomainConnectionSetupTemplateUrl();
		if ( domainConnectionSetupUrl ) {
			queryArgs.domainConnectionSetupUrl = domainConnectionSetupUrl;
		}
	}

	queryArgs.dashboard = getCurrentDashboard();
	queryArgs.back_to = redirectToDashboardLink();

	return queryArgs;
}

interface AddDomainButtonProps {
	/**
	 * The site's canonical slug. The route param can hold any domain on the site,
	 * which the Stepper domain flow cannot resolve.
	 */
	siteSlug?: string;
}

function DomainOnlyAddDomainButton( { siteSlug }: AddDomainButtonProps ) {
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
		<AddDomainButtons
			onSearchClick={ onSearchClick }
			onTransferOrConnectClick={ onTransferOrConnectClick }
		/>
	);
}

function DefaultAddDomainButton( { siteSlug }: AddDomainButtonProps ) {
	const queryArgs = buildDomainQueryArgs( siteSlug );

	const onSearchClick = () => {
		window.location.href = addQueryArgs( wpcomLink( '/setup/domain' ), queryArgs );
	};

	const onTransferOrConnectClick = () => {
		window.location.href = addQueryArgs( wpcomLink( '/setup/domain/use-my-domain' ), queryArgs );
	};

	return (
		<AddDomainButtons
			onSearchClick={ onSearchClick }
			onTransferOrConnectClick={ onTransferOrConnectClick }
		/>
	);
}

const FILL_ROW_STYLE = { flexGrow: 1, justifyContent: 'center' };

function AddDomainButtons( {
	onSearchClick,
	onTransferOrConnectClick,
}: {
	onSearchClick: () => void;
	onTransferOrConnectClick: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const hasEnTranslation = useHasEnTranslation();

	// Existing funnels expect `add_domain_clicked` followed by `add_domain_option_clicked`.
	const recordOptionClick = ( option: 'search' | 'transfer_or_connect' ) => {
		recordTracksEvent( 'calypso_dashboard_domains_add_domain_clicked' );
		recordTracksEvent( 'calypso_dashboard_domains_add_domain_option_clicked', { option } );
	};

	return (
		<HStack spacing={ 2 } wrap>
			<Button
				variant="tertiary"
				__next40pxDefaultSize
				style={ FILL_ROW_STYLE }
				onClick={ () => {
					recordOptionClick( 'transfer_or_connect' );
					onTransferOrConnectClick();
				} }
			>
				{ __( 'Use a domain name I own' ) }
			</Button>
			<Button
				variant="primary"
				__next40pxDefaultSize
				style={ FILL_ROW_STYLE }
				onClick={ () => {
					recordOptionClick( 'search' );
					onSearchClick();
				} }
			>
				{ hasEnTranslation( 'Add new domain' ) ? __( 'Add new domain' ) : __( 'Add domain name' ) }
			</Button>
		</HStack>
	);
}

export default function AddDomainButton( { siteSlug: siteSlugProp }: AddDomainButtonProps ) {
	const { supports } = useAppContext();
	const router = useRouter();
	const { siteSlug: routeSiteSlug } = router.matchRoute( siteRoute.fullPath );
	const siteSlug = siteSlugProp ?? routeSiteSlug;

	if ( supports.domainOnlySites ) {
		return <DomainOnlyAddDomainButton siteSlug={ siteSlug } />;
	}

	return <DefaultAddDomainButton siteSlug={ siteSlug } />;
}
