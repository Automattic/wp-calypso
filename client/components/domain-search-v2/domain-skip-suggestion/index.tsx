import { recordTracksEvent } from '@automattic/calypso-analytics';
import { DomainSuggestion } from '@automattic/data-stores';
import { useDomainSearch } from '@automattic/domain-search';
import {
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useEffect, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { Site } from 'calypso/dashboard/data/site';
import { DomainSkipSuggestionPlaceholder } from './index.placeholder';
import { DomainSkipSkeleton } from './index.skeleton';

import './style.scss';

type BaseProps = {
	onSkip: () => void;
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

const DomainSkipSuggestion = ( { selectedSite, subdomainSuggestion, onSkip }: Props ) => {
	const translate = useTranslate();
	const { cart } = useDomainSearch();

	const hasExistingSite = !! selectedSite;
	const domain = hasExistingSite ? selectedSite?.slug : subdomainSuggestion?.domain_name;
	const [ subdomain, ...tlds ] = domain?.split( '.' ) || [];

	const onSkipClick = useCallback( () => {
		if ( selectedSite ) {
			// Skip it when we have a selected site
			onSkip();
		} else {
			// Add the subdomain suggestion to the cart and move to the next step
			cart.onAddItem( subdomainSuggestion?.domain_name );
		}
	}, [ selectedSite, cart, subdomainSuggestion?.domain_name, onSkip ] );

	useEffect( () => {
		if ( ! selectedSite && ! subdomainSuggestion ) {
			recordTracksEvent( 'calypso_domain_search_skip_no_site_or_suggestion' );
		}
	}, [ selectedSite, subdomainSuggestion ] );

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

	if ( ! selectedSite && ! subdomainSuggestion ) {
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
