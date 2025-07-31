import { DomainSuggestion } from '@automattic/data-stores';
import { useDomainSearch } from '@automattic/domain-search';
import {
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { Site } from 'calypso/dashboard/data/site';
import { DomainSkipSuggestionPlaceholder } from './index.placeholder';
import { DomainSkipSkeleton } from './index.skeleton';

import './style.scss';

interface Props {
	selectedSite?: Site;
	subdomainSuggestion?: DomainSuggestion;
	onSkip: () => void;
}

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

	let title;
	if ( hasExistingSite ) {
		title = translate( 'Current address' );
	} else if ( subdomain ) {
		title = translate( 'WordPress.com subdomain' );
	} else {
		title = translate( 'Skip domain search' );
	}

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

	let subtitle;
	if ( hasExistingSite ) {
		subtitle = translate(
			'Keep {{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} as your site address',
			translateArgs
		);
	} else if ( subdomain ) {
		subtitle = translate(
			'{{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} is included',
			translateArgs
		);
	} else {
		subtitle = translate( 'You can search for a custom domain later' );
	}

	let ctaLabel;
	if ( hasExistingSite || subdomain ) {
		ctaLabel = translate( 'Skip purchase' );
	} else {
		ctaLabel = translate( 'Skip' );
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
