/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { addReaderListTag, deleteReaderListTag } from 'calypso/state/reader/lists/actions';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';
import ItemRemoveDialogue from './item-remove-dialogue';
import { Item, Tag } from './types';

function TagTitle( { tag: { display_name, slug } } ) {
	return <>{ display_name || slug }</>;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function TagItem( props: { item: Item; list: List; owner: string } ) {
	const { item, list, owner } = props;
	const tag: Tag = props.item.meta?.data?.tag?.tag as Tag;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const isInList = useSelector( ( state ) =>
		getMatchingItem( state, { tagId: props.item.tag_ID, listId: list.ID } )
	);

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = React.useState( false );
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

	return ! tag ? (
		// TODO: Add support for removing invalid tag list item
		<SitePlaceholder />
	) : (
		<>
			<div className="tag-item list-item">
				<a className="list-item__content" href={ `/read/tag/${ encodeURIComponent( tag.slug ) }` }>
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

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ translate( 'Add' ) }
				</Button>
			) : (
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Remove' ) }
				</Button>
			) }

			<ItemRemoveDialogue
				onClose={ deleteItem }
				title={ <TagTitle tag={ tag } /> }
				type="tag"
				visibility={ showDeleteConfirmation }
			/>
		</>
	);
}
