import {
	createReadListMutation,
	readListItemsAllQuery,
	readListQuery,
	updateReadListMutation,
} from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_LIST } from 'calypso/blocks/reader-export-button/constants';
import EmptyContent from 'calypso/components/empty-content';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { preventWidows } from 'calypso/lib/formatting';
import ReaderMain from 'calypso/reader/components/reader-main';
import ListMissing from 'calypso/reader/list/components/missing';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import ItemAdder from './item-adder';
import ListDelete from './list-delete';
import ListForm from './list-form';
import ListItem from './list-item';
import SubscriptionItemAdder from './subscription-item-adder';

import './style.scss';

function Details( { list } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { mutate: updateList, isPending: isUpdatingList } = useMutation(
		updateReadListMutation( queryClient )
	);

	const handleSubmit = ( newList ) => {
		updateList( newList, {
			onSuccess: () => {
				dispatch(
					successNotice( translate( 'List updated successfully.' ), {
						duration: DEFAULT_NOTICE_DURATION,
					} )
				);
			},
			onError: () => {
				dispatch( errorNotice( translate( 'Unable to update list.' ) ) );
			},
		} );
	};

	return (
		<ListForm list={ list } isSubmissionDisabled={ isUpdatingList } onSubmit={ handleSubmit } />
	);
}

function Items( { list, listItems, owner } ) {
	const translate = useTranslate();
	if ( ! listItems ) {
		return <Card>{ translate( 'Loading…' ) }</Card>;
	}
	return (
		<>
			<ItemAdder key="item-adder" list={ list } listItems={ listItems } owner={ owner } />
			{ listItems?.length > 0 && (
				<>
					<h1 className="list-manage__subscriptions-header">{ translate( 'Added sites' ) }</h1>
					{ listItems.map( ( item ) => (
						<ListItem
							key={ item.feed_ID || item.site_ID || item.tag_ID }
							owner={ owner }
							list={ list }
							item={ item }
						/>
					) ) }
				</>
			) }
			<SubscriptionItemAdder list={ list } listItems={ listItems } owner={ owner } />
		</>
	);
}

function Export( { list, listItems } ) {
	const translate = useTranslate();
	return (
		<Card>
			<p>
				{ translate(
					'You can export this list to use on other services. The file will be in OPML format.'
				) }
			</p>
			<ReaderExportButton
				exportType={ READER_EXPORT_TYPE_LIST }
				listId={ list.ID }
				disabled={ ! listItems?.length }
				variant="primary"
			/>
		</Card>
	);
}

function ReaderListCreate() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const { mutate: createList, isPending: isCreatingList } = useMutation(
		createReadListMutation( queryClient )
	);

	const handleSubmit = ( formList ) => {
		const params = {
			title: formList.title,
			description: formList.description,
			is_public: formList.is_public,
		};
		createList( params, {
			onSuccess: ( data ) => {
				if ( data.list?.owner && data.list?.slug ) {
					page( `/reader/list/${ data.list.owner }/${ data.list.slug }/edit/items` );
					dispatch(
						successNotice( translate( 'List created successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} )
					);
				} else {
					dispatch( errorNotice( translate( 'Unable to create new list.' ) ) );
				}
			},
			onError: () => {
				dispatch( errorNotice( translate( 'Unable to create new list.' ) ) );
			},
		} );
	};

	return (
		<ReaderMain>
			<NavigationHeader title={ translate( 'Create List' ) } />
			<ListForm isCreateForm isSubmissionDisabled={ isCreatingList } onSubmit={ handleSubmit } />
		</ReaderMain>
	);
}

function ReaderListEdit( props ) {
	const { selectedSection } = props;
	const translate = useTranslate();
	const { data, isFetched } = useQuery( readListQuery( props.owner, props.slug ) );
	const list = data?.list;
	const isMissing = isFetched && ! list;
	const { data: itemsData } = useQuery( {
		...readListItemsAllQuery( props.owner, props.slug ),
		enabled: !! list,
	} );
	const listItems = itemsData?.items;
	const sectionProps = { ...props, list, listItems };

	// Only the list owner can manage the list
	if ( list && ! list.is_owner ) {
		return (
			<EmptyContent
				title={ preventWidows( translate( "You don't have permission to manage this list." ) ) }
			/>
		);
	}

	// The list does not exist
	if ( isMissing ) {
		return <ListMissing />;
	}

	return (
		<>
			<ReaderMain>
				<NavigationHeader
					title={ translate( 'Manage %(listName)s', {
						args: { listName: list?.title || decodeURIComponent( props.slug ) },
					} ) }
				/>
				{ ! list && <Card>{ translate( 'Loading…' ) }</Card> }
				{ list && (
					<>
						<SectionNav variation="minimal">
							<NavTabs>
								<NavItem
									selected={ selectedSection === 'details' }
									path={ `/reader/list/${ props.owner }/${ props.slug }/edit` }
								>
									{ translate( 'Details' ) }
								</NavItem>
								<NavItem
									selected={ selectedSection === 'items' }
									count={ listItems?.length }
									path={ `/reader/list/${ props.owner }/${ props.slug }/edit/items` }
								>
									{ translate( 'Sites' ) }
								</NavItem>

								<NavItem
									selected={ selectedSection === 'export' }
									path={ `/reader/list/${ props.owner }/${ props.slug }/export` }
								>
									{ translate( 'Export' ) }
								</NavItem>
								{ ! list?.is_immutable && (
									<NavItem
										selected={ selectedSection === 'delete' }
										path={ `/reader/list/${ props.owner }/${ props.slug }/delete` }
									>
										{ translate( 'Delete' ) }
									</NavItem>
								) }
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && <Details { ...sectionProps } /> }
						{ selectedSection === 'items' && <Items { ...sectionProps } /> }
						{ selectedSection === 'export' && <Export { ...sectionProps } /> }
						{ selectedSection === 'delete' && <ListDelete { ...sectionProps } /> }
					</>
				) }
			</ReaderMain>
		</>
	);
}

export default function ReaderListManage( props ) {
	return props.isCreateForm ? <ReaderListCreate /> : <ReaderListEdit { ...props } />;
}
