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
	selectedSite?: { URL: string };
	subdomainSuggestion?: { domain_name: string };
}

const DomainSkipSuggestion = ( { selectedSite, subdomainSuggestion }: Props ) => {
	const translate = useTranslate();
	const { cart, onContinue } = useDomainSearch();

	if ( selectedSite ) {
		const [ subdomain, ...tlds ] = new URL( selectedSite.URL ).hostname.split( '.' ) ?? [];

		return (
			<DomainSkipSkeleton
				title={
					<Heading level="4" weight="normal">
						{ translate( 'Current address' ) }
					</Heading>
				}
				subtitle={
					<Text>
						{ translate(
							'Keep %(subdomain)s{{strong}}.%(domainName)s{{/strong}} as your site address',
							{
								args: {
									subdomain: subdomain,
									domainName: tlds.join( '.' ),
								},
								components: {
									strong: <strong />,
								},
							}
						) }
					</Text>
				}
				right={
					<Button
						className="subdomain-skip-suggestion__btn"
						variant="secondary"
						onClick={ onContinue }
						disabled={ cart.isBusy }
					>
						{ translate( 'Skip purchase' ) }
					</Button>
				}
			/>
		);
	}

	if ( ! subdomainSuggestion ) {
		throw new Error( 'No selected site but no suggestion was passed.' );
	}

	const [ subdomain, ...tlds ] = subdomainSuggestion.domain_name.split( '.' ) ?? [];

	return (
		<DomainSkipSkeleton
			title={
				<Heading level="4" weight="normal">
					{ translate( 'WordPress.com subdomain' ) }
				</Heading>
			}
			subtitle={
				<Text>
					{ translate( '%(subdomain)s{{strong}}.%(domainName)s{{/strong}} is included', {
						args: {
							subdomain: subdomain,
							domainName: tlds.join( '.' ),
						},
						components: {
							strong: <strong />,
						},
					} ) }
				</Text>
			}
			right={
				<Button
					className="subdomain-skip-suggestion__btn"
					variant="secondary"
					onClick={ () => {
						cart.onAddItem( subdomainSuggestion.domain_name );
					} }
					disabled={ cart.isBusy }
				>
					{ translate( 'Skip purchase' ) }
				</Button>
			}
		/>
	);
};

DomainSkipSuggestion.Placeholder = DomainSkipSuggestionPlaceholder;

export default DomainSkipSuggestion;
