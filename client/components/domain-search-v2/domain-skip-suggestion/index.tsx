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
	onSkip: () => void;
}

const DomainSkipSuggestion = ( { domain, onSkip }: Props ) => {
	const translate = useTranslate();
	const [ subdomain, ...tlds ] = domain.split( '.' );

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
				<Button className="subdomain-skip-suggestion__btn" variant="secondary" onClick={ onSkip }>
					{ translate( 'Skip purchase' ) }
				</Button>
			}
		/>
	);
};

DomainSkipSuggestion.Placeholder = DomainSkipSuggestionPlaceholder;

export default DomainSkipSuggestion;
