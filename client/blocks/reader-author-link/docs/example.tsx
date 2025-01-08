import { Card } from '@automattic/components';
import ReaderAuthorLink, { ReaderLinkAuthor } from 'calypso/blocks/reader-author-link';

export default function ReaderAuthorLinkExample(): JSX.Element {
	const author: ReaderLinkAuthor = {
		URL: 'http://wpcalypso.wordpress.com',
		name: 'Barnaby Blogwit',
	};

	return (
		<Card>
			<ReaderAuthorLink author={ author }>Author site</ReaderAuthorLink>
		</Card>
	);
}

ReaderAuthorLinkExample.displayName = 'ReaderAuthorLink';
