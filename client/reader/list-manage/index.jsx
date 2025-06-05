import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_LIST } from 'calypso/blocks/reader-export-button/constants';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import QueryReaderListItems from 'calypso/components/data/query-reader-list-items';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { preventWidows } from 'calypso/lib/formatting';
import Missing from 'calypso/reader/list-stream/missing';
import { createReaderList, updateReaderList } from 'calypso/state/reader/lists/actions';
import {
	getListByOwnerAndSlug,
	getListItems,
	isCreatingList as isCreatingListSelector,
	isUpdatingList as isUpdatingListSelector,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import ItemAdder from './item-adder';
import ListDelete from './list-delete';
import ListForm from './list-form';
import ListItem from './list-item';

import './style.scss';

function Details( { list } ) {
	const dispatch = useDispatch();
	const isUpdatingList = useSelector( isUpdatingListSelector );

	return (
		<ListForm
			list={ list }
			isSubmissionDisabled={ isUpdatingList }
			onSubmit={ ( newList ) => dispatch( updateReaderList( newList ) ) }
		/>
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
	const isCreatingList = useSelector( isCreatingListSelector );

	return (
		<Main>
			<NavigationHeader title={ translate( 'Create List' ) } />
			<ListForm
				isCreateForm
				isSubmissionDisabled={ isCreatingList }
				onSubmit={ ( list ) => dispatch( createReaderList( list ) ) }
			/>
		</Main>
	);
}

function ReaderListEdit( props ) {
	const { selectedSection } = props;
	const translate = useTranslate();
	const list = useSelector( ( state ) => getListByOwnerAndSlug( state, props.owner, props.slug ) );
	const isMissing = useSelector( ( state ) =>
		isMissingByOwnerAndSlug( state, props.owner, props.slug )
	);
	const listItems = useSelector( ( state ) =>
		list ? getListItems( state, list.ID ) : undefined
	);
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
		return <Missing />;
	}

	return (
		<>
			{ ! list && <QueryReaderList owner={ props.owner } slug={ props.slug } /> }
			{ ! listItems && list && <QueryReaderListItems owner={ props.owner } slug={ props.slug } /> }
			<Main>
				<NavigationHeader
					title={ translate( 'Manage %(listName)s', {
						args: { listName: list?.title || decodeURIComponent( props.slug ) },
					} ) }
				/>
				{ ! list && <Card>{ translate( 'Loading…' ) }</Card> }
				{ list && (
					<>
						<SectionNav>
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
			</Main>
		</>
	);
}

export default function ReaderListManage( props ) {
	return props.isCreateForm ? <ReaderListCreate /> : <ReaderListEdit { ...props } />;
}
