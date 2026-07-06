import './followed-tags.scss';

import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFollowedTags } from 'calypso/reader/data/tags';

export function FollowedTags(): JSX.Element {
	const translate = useTranslate();
	const { isLoading, data: tags } = useFollowedTags();

	function onTagClick( slug: string ): void {
		recordTracksEvent( 'calypso_tags_page_following_tag_clicked', {
			tag: slug,
		} );
	}

	return (
		<div className="followed-tags__container">
			<div className="tags__header">
				<h4>{ translate( 'Following' ) }</h4>
			</div>

			<div className="followed-tags__list">
				{ isLoading && (
					<div className="wp-spinner-wrapper" style={ { margin: '0 auto' } }>
						<Spinner />
					</div>
				) }

				{ ! isLoading && tags?.length === 0 && (
					<p className="followed-tags__placeholder">
						{ translate(
							'Tags you follow will appear here. Explore the tags below to get started.'
						) }
					</p>
				) }

				{ tags?.map( ( tag ) => (
					<a
						key={ tag.slug }
						className="followed-tags__pill"
						href={ addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( tag.slug ) }` ) }
						onClick={ () => onTagClick( tag.slug ) }
					>
						{ tag.title }
					</a>
				) ) }
			</div>
		</div>
	);
}
