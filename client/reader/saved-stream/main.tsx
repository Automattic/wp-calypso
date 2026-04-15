import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSelector } from 'calypso/state';
import {
	getSavedPostsCount,
	getSavedPostsTotalReadingTime,
} from 'calypso/state/reader/saved/selectors';
import EmptyContent from './empty';
import { SavedPostsList, type SortOrder } from './saved-posts-list';

import './style.scss';

export default function SavedPostsStream() {
	const translate = useTranslate();
	const count = useSelector( getSavedPostsCount );
	const totalReadingTime = useSelector( getSavedPostsTotalReadingTime );
	const [ sortOrder, setSortOrder ] = useState< SortOrder >( 'newest' );

	const title = translate( 'Saved' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "Saved"',
	} );

	const subtitle = translate( 'Your reading list for later.' );

	return (
		<ReaderMain className="saved-stream">
			<DocumentHead title={ documentTitle } />
			<NavigationHeader title={ title } subtitle={ subtitle } />
			{ count === 0 ? (
				<EmptyContent />
			) : (
				<div className="saved-stream__list">
					<div className="saved-stream__toolbar">
						<p className="saved-stream__summary">
							{ translate( '%(count)d article', '%(count)d articles', {
								count,
								args: { count },
							} ) }
							{ totalReadingTime > 0 &&
								translate( ' · ~%(minutes)d min total', {
									args: { minutes: totalReadingTime },
									comment: 'Total reading time for saved posts',
								} ) }
						</p>
						<ToggleGroupControl
							className="saved-stream__sort"
							label={ translate( 'Sort by' ) }
							hideLabelFromVision
							value={ sortOrder }
							onChange={ ( value ) => setSortOrder( value as SortOrder ) }
							isBlock
							__nextHasNoMarginBottom
						>
							<ToggleGroupControlOption label={ translate( 'Newest' ) } value="newest" />
							<ToggleGroupControlOption label={ translate( 'Oldest' ) } value="oldest" />
						</ToggleGroupControl>
					</div>
					<SavedPostsList sortOrder={ sortOrder } />
				</div>
			) }
		</ReaderMain>
	);
}
