import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { useDispatch, useSelector } from 'calypso/state';
import { addReaderListTag, deleteReaderListTag } from 'calypso/state/reader/lists/actions';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';
import ItemRemoveDialog from './item-remove-dialog';
import { Item, List, Tag } from './types';

function TagTitle( { tag: { display_name, slug } }: { tag: Tag } ) {
	return <>{ display_name || slug }</>;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function TagItem( props: {
	hideIfInList?: boolean;
	isFollowed?: boolean;
	item: Item;
	list: List;
	owner: string;
} ) {
	const { item, list, owner } = props;
	const tag: Tag = props.item.meta?.data?.tag?.tag as Tag;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const isInList = !! useSelector( ( state ) =>
		getMatchingItem( state, { tagId: props.item.tag_ID, listId: list.ID } )
	);

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState( false );
	const addItem = () =>
		dispatch( addReaderListTag( list.ID, owner, list.slug, item.meta?.data?.tag?.tag.slug ) );
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		shouldDelete &&
			dispatch(
				deleteReaderListTag(
					list.ID,
					owner,
					list.slug,
					item.tag_ID,
					item.meta?.data?.tag?.tag.slug
				)
			);
	};

	if ( isInList && props.hideIfInList ) {
		return null;
	}

	return ! tag ? (
		// TODO: Add support for removing invalid tag list item
		<Card className="list-manage__site-card">
			<SitePlaceholder />
		</Card>
	) : (
		<Card className="list-manage__site-card">
			<div className="tag-item list-item">
				<a
					className="list-item__content"
					href={ `/reader/tag/${ encodeURIComponent( tag.slug ) }` }
				>
					<div className="list-item__icon">
						<Gridicon icon="tag" size={ 36 } />
					</div>

					<div className="list-item__info">
						<div className="list-item__title">
							<TagTitle tag={ tag } />
						</div>
						<div className="list-item__domain">{ tag.slug }</div>
					</div>
				</a>
			</div>

			{ props.isFollowed && (
				<FollowButton followLabel={ translate( 'Following site' ) } following />
			) }

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ translate( 'Add' ) }
				</Button>
			) : (
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Remove' ) }
				</Button>
			) }

			<ItemRemoveDialog
				onClose={ deleteItem }
				title={ <TagTitle tag={ tag } /> }
				type="tag"
				visibility={ showDeleteConfirmation }
			/>
		</Card>
	);
}
