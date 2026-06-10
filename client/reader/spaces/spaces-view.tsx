import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { getSpaceById } from './spaces-data';

interface Props {
	id?: string;
}

export function SpacesView( { id }: Props ) {
	const translate = useTranslate();
	const space = id ? getSpaceById( id ) : undefined;
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

export default SpacesView;
