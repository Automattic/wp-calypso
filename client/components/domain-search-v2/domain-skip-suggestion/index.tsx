import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSuggestion } from '@automattic/data-stores';
import {
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useEffect, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { Site } from 'calypso/dashboard/data/site';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useDomainSearch } from '../__legacy/domain-search';
import { DomainSkipSuggestionPlaceholder } from './index.placeholder';
import { DomainSkipSkeleton } from './index.skeleton';

import './style.scss';

type BaseProps = {
	flowName?: string;
	query?: string;
	onSkip: () => void;
	isLoadingSubdomainSuggestions?: boolean;
};

type WithSelectedSite = BaseProps & {
	selectedSite: Site;
	subdomainSuggestion?: DomainSuggestion;
};

type WithSubdomainSuggestion = BaseProps & {
	selectedSite?: Site;
	subdomainSuggestion: DomainSuggestion;
};

type Props = WithSelectedSite | WithSubdomainSuggestion;

const DomainSkipSuggestion = ( {
	selectedSite,
	subdomainSuggestion,
	isLoadingSubdomainSuggestions,
	flowName,
	query,
	onSkip,
}: Props ) => {
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const { cart } = useDomainSearch();

	const hasExistingSite = !! selectedSite;
	const hasSubdomainSuggestion = !! subdomainSuggestion;
	const domain = hasExistingSite ? selectedSite?.slug : subdomainSuggestion?.domain_name;
	const [ subdomain, ...tlds ] = domain?.split( '.' ) ?? [];

	useEffect( () => {
		if ( isLoadingSubdomainSuggestions ) {
			return;
		}

		if ( ! hasExistingSite && ! hasSubdomainSuggestion ) {
			recordTracksEvent( 'calypso_domain_search_skip_no_site_and_suggestion', {
				query,
				user_id: currentUser?.ID,
				flow_name: flowName,
			} );
		}
	}, [
		hasExistingSite,
		hasSubdomainSuggestion,
		query,
		currentUser?.ID,
		flowName,
		isLoadingSubdomainSuggestions,
	] );

	const onSkipClick = useCallback( () => {
		if ( selectedSite ) {
			// Skip it when we have a selected site
			onSkip();
		} else if ( subdomainSuggestion?.domain_name ) {
			// Add the subdomain suggestion to the cart and move to the next step
			cart.onAddItem( subdomainSuggestion.domain_name );
		}
	}, [ selectedSite, cart, subdomainSuggestion?.domain_name, onSkip ] );

	const translateArgs = {
		args: {
			subdomain: subdomain,
			domainName: tlds.join( '.' ),
		},
		components: {
			domain: <span style={ { wordBreak: 'break-word', hyphens: 'none' } } />,
			strong: <strong style={ { whiteSpace: 'nowrap' } } />,
		},
	};

	let title;
	let subtitle;
	let ctaLabel;
	if ( hasExistingSite ) {
		title = translate( 'Current address' );
		subtitle = translate(
			'Keep {{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} as your site address',
			translateArgs
		);
		ctaLabel = translate( 'Skip purchase' );
	} else if ( subdomain ) {
		title = translate( 'WordPress.com subdomain' );
		subtitle = translate(
			'{{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} is included',
			translateArgs
		);
		ctaLabel = translate( 'Skip purchase' );
	}

	if ( ! hasExistingSite && ! hasSubdomainSuggestion ) {
		return null;
	}

	return (
		<DomainSkipSkeleton
			title={
				<Heading level="4" weight="normal">
					{ title }
				</Heading>
			}
			subtitle={ <Text>{ subtitle }</Text> }
			right={
				<Button
					className="subdomain-skip-suggestion__btn"
					variant="secondary"
					onClick={ onSkipClick }
					disabled={ cart.isBusy }
					__next40pxDefaultSize
				>
					{ ctaLabel }
				</Button>
			}
		/>
	);
};

DomainSkipSuggestion.Placeholder = DomainSkipSuggestionPlaceholder;

export default DomainSkipSuggestion;
