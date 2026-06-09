import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { getSpaceBySlug } from './spaces-data';

interface Props {
	slug?: string;
}

export function SpacesView( { slug }: Props ) {
	const translate = useTranslate();
	const space = slug ? getSpaceBySlug( slug ) : undefined;
	const title = space ? space.name : translate( 'Spaces' );

	return (
		<ReaderMain className="reader-spaces">
			<DocumentHead title={ translate( '%(title)s ‹ Reader', { args: { title } } ) } />
			<NavigationHeader title={ title } />
		</ReaderMain>
	);
}

export default SpacesView;
