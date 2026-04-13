import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

export default function SavedStreamEmpty() {
	const translate = useTranslate();

	return (
		<EmptyContent
			title={ translate( 'No saved posts yet' ) }
			line={ translate( 'Save posts to read them later.' ) }
			action={
				<a className="empty-content__action button is-primary" href="/reader">
					{ translate( 'Back to Reader' ) }
				</a>
			}
		/>
	);
}
