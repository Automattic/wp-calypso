/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import {
	getListByOwnerAndSlug,
	getListItems,
	isCreatingList as isCreatingListSelector,
	isUpdatingList as isUpdatingListSelector,
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import FormattedHeader from 'calypso/components/formatted-header';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import QueryReaderListItems from 'calypso/components/data/query-reader-list-items';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import Main from 'calypso/components/main';
import { createReaderList, updateReaderList } from 'calypso/state/reader/lists/actions';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_LIST } from 'calypso/blocks/reader-export-button/constants';
import Missing from 'calypso/reader/list-stream/missing';
import ItemAdder from './item-adder';
import ListDelete from './list-delete';
import ListForm from './list-form';
import ListItem from './list-item';
import EmptyContent from 'calypso/components/empty-content';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
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
			{ listItems?.length > 0 && (
				<>
					<h1 className="list-manage__subscriptions-header">
						{ translate( 'Added sites' ) }
						<Button compact primary href="#reader-list-item-adder">
							{ translate( 'Add Site' ) }
						</Button>
					</h1>
					{ listItems.map( ( item ) => (
						<ListItem
							key={ item.feed_ID || item.site_ID || item.tag_ID }
							owner={ owner }
							list={ list }
							item={ item }
						/>
					) ) }
					<hr className="list-manage__subscriptions-separator" />
				</>
			) }
			<ItemAdder key="item-adder" list={ list } listItems={ listItems } owner={ owner } />
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
				disabled={ ! listItems || listItems.length === 0 }
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
			<FormattedHeader headerText={ translate( 'Create List' ) } />
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
				illustration="/calypso/images/illustrations/error.svg"
			/>
		);
	}

	return (
		<>
			{ ! list && <QueryReaderList owner={ props.owner } slug={ props.slug } /> }
			{ ! listItems && list && <QueryReaderListItems owner={ props.owner } slug={ props.slug } /> }
			<Main>
				<FormattedHeader
					headerText={ translate( 'Manage %(listName)s', {
						args: { listName: list?.title || decodeURIComponent( props.slug ) },
					} ) }
				/>
				{ ! list && ! isMissing && <Card>{ translate( 'Loading…' ) }</Card> }
				{ isMissing && <Missing /> }
				{ list && (
					<>
						<SectionNav>
							<NavTabs>
								<NavItem
									selected={ selectedSection === 'details' }
									path={ `/read/list/${ props.owner }/${ props.slug }/edit` }
								>
									{ translate( 'Details' ) }
								</NavItem>
								<NavItem
									selected={ selectedSection === 'items' }
									count={ listItems?.length }
									path={ `/read/list/${ props.owner }/${ props.slug }/edit/items` }
								>
									{ translate( 'Sites' ) }
								</NavItem>

								<NavItem
									selected={ selectedSection === 'export' }
									path={ `/read/list/${ props.owner }/${ props.slug }/export` }
								>
									{ translate( 'Export' ) }
								</NavItem>
								<NavItem
									selected={ selectedSection === 'delete' }
									path={ `/read/list/${ props.owner }/${ props.slug }/delete` }
								>
									{ translate( 'Delete' ) }
								</NavItem>
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
	return props.isCreateForm ? ReaderListCreate() : ReaderListEdit( props );
}
