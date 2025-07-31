import { useDomainSearch } from '@automattic/domain-search';
import {
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { DomainSkipSuggestionPlaceholder } from './index.placeholder';
import { DomainSkipSkeleton } from './index.skeleton';

import './style.scss';

interface Props {
	domain: string;
	hasExistingSite?: boolean;
	onSkip: () => void;
}

const DomainSkipSuggestion = ( { domain, hasExistingSite, onSkip }: Props ) => {
	const translate = useTranslate();
	const { cart } = useDomainSearch();
	const [ subdomain, ...tlds ] = domain.split( '.' );

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
					onClick={ onSkip }
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
