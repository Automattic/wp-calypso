import {
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface Props {
	domain: string;
	onSkip: () => void;
}

const DomainSkipSuggestion = ( { domain, onSkip }: Props ) => {
	const translate = useTranslate();
	const [ subdomain, ...tlds ] = domain.split( '.' );

	return (
		<Card className="subdomain-skip-suggestion">
			<CardBody>
				<div className="subdomain-skip-suggestion__content">
					<Heading level="4" weight="normal">
						{ translate( 'WordPress.com subdomain' ) }
					</Heading>
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
				</div>
				{ onSkip && (
					<Button className="subdomain-skip-suggestion__btn" variant="secondary" onClick={ onSkip }>
						{ translate( 'Skip purchase' ) }
					</Button>
				) }
			</CardBody>
		</Card>
	);
};

export default DomainSkipSuggestion;
