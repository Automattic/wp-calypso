import {
	addReadListTagMutation,
	deleteReadListTagMutation,
	readListItemsAllQuery,
} from '@automattic/api-queries';
import { Button, Card, Gridicon } from '@automattic/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
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
	const queryClient = useQueryClient();
	const { mutate: addTag } = useMutation( addReadListTagMutation( queryClient ) );
	const { mutate: deleteTag } = useMutation( deleteReadListTagMutation( queryClient ) );

	const { data: isInList = false } = useQuery( {
		...readListItemsAllQuery( owner, list.slug ),
		select: ( itemsData ) =>
			!! item.tag_ID &&
			!! itemsData?.items?.some(
				( listItem ) => Number( listItem.tag_ID ) === Number( item.tag_ID )
			),
	} );

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState( false );
	const addItem = () => {
		const tagSlug = item.meta?.data?.tag?.tag.slug;
		if ( ! tagSlug ) {
			return;
		}
		addTag(
			{
				owner,
				slug: list.slug,
				tagSlug,
				tagId: item.tag_ID ? Number( item.tag_ID ) : undefined,
			},
			{
				onSuccess: () => {
					dispatch(
						successNotice( translate( 'Tag added to list successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} )
					);
				},
				onError: () => {
					dispatch( errorNotice( translate( 'Unable to add tag to list.' ) ) );
				},
			}
		);
	};
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		const tagSlug = item.meta?.data?.tag?.tag.slug;
		if ( ! shouldDelete || ! item.tag_ID || ! tagSlug ) {
			return;
		}
		deleteTag(
			{ owner, slug: list.slug, tagId: Number( item.tag_ID ), tagSlug },
			{
				onSuccess: () => {
					dispatch(
						successNotice( translate( 'Tag removed from list successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} )
					);
				},
				onError: () => {
					dispatch( errorNotice( translate( 'Unable to remove tag from list.' ) ) );
				},
			}
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
