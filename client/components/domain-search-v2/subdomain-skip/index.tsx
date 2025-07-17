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
	subdomain?: string;
	onSkip: () => void;
}

const SubdomainSkip = ( { subdomain, onSkip }: Props ) => {
	const translate = useTranslate();

	return (
		<Card className="subdomain-skip">
			<CardBody>
				<div className="subdomain-skip__content">
					<Heading level="4" weight="normal">
						{ translate( 'WordPress.com subdomain' ) }
					</Heading>
					<Text>
						{ translate( '%(subdomain)s.{{strong}}wordpress.com{{/strong}} is included', {
							args: {
								subdomain: subdomain ?? 'wordpress.com',
							},
							components: {
								strong: <strong />,
							},
						} ) }
					</Text>
				</div>
				<Button className="subdomain-skip__btn" variant="secondary" onClick={ onSkip }>
					{ translate( 'Skip purchase' ) }
				</Button>
			</CardBody>
		</Card>
	);
};

export default SubdomainSkip;
