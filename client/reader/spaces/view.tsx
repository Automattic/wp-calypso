import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSpaces } from 'calypso/reader/data/spaces';

interface Props {
	id?: string;
}

export function SpacesView( { id }: Props ) {
	const translate = useTranslate();
	const spaces = useSpaces();
	const space = id ? spaces.find( ( item ) => item.id === id ) : undefined;
	const title = space ? space.name : translate( 'Spaces' );

	return (
		<ReaderMain className="reader-spaces">
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the space name, or "Spaces" for the landing view',
					textOnly: true,
				} ) }
			/>
			<NavigationHeader title={ title } />
		</ReaderMain>
	);
}
