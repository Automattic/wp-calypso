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

	return (
		<DomainSkipSkeleton
			title={
				<Heading level="4" weight="normal">
					{ hasExistingSite
						? translate( 'Current address' )
						: translate( 'WordPress.com subdomain' ) }
				</Heading>
			}
			subtitle={
				<Text>
					{ hasExistingSite
						? translate(
								'Keep {{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} as your site address',
								{
									args: {
										subdomain: subdomain,
										domainName: tlds.join( '.' ),
									},
									components: {
										domain: <span style={ { wordBreak: 'break-word', hyphens: 'none' } } />,
										strong: <strong style={ { whiteSpace: 'nowrap' } } />,
									},
								}
						  )
						: translate(
								'{{domain}}%(subdomain)s{{strong}}.%(domainName)s{{/strong}}{{/domain}} is included',
								{
									args: {
										subdomain: subdomain,
										domainName: tlds.join( '.' ),
									},
									components: {
										domain: <span style={ { wordBreak: 'break-word', hyphens: 'none' } } />,
										strong: <strong style={ { whiteSpace: 'nowrap' } } />,
									},
								}
						  ) }
				</Text>
			}
			right={
				<Button
					className="subdomain-skip-suggestion__btn"
					variant="secondary"
					onClick={ onSkipClick }
					disabled={ cart.isBusy }
					__next40pxDefaultSize
				>
					{ translate( 'Skip purchase' ) }
				</Button>
			}
		/>
	);
};

DomainSkipSuggestion.Placeholder = DomainSkipSuggestionPlaceholder;

export default DomainSkipSuggestion;
