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
} from 'state/reader/lists/selectors';
import FormattedHeader from 'components/formatted-header';
import FormSectionHeading from 'components/forms/form-section-heading';
import QueryReaderList from 'components/data/query-reader-list';
import QueryReaderListItems from 'components/data/query-reader-list-items';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Main from 'components/main';
import { createReaderList, updateReaderList } from 'state/reader/lists/actions';
import ReaderExportButton from 'blocks/reader-export-button';
import { READER_EXPORT_TYPE_LIST } from 'blocks/reader-export-button/constants';
import ListItem from './list-item';
import ListForm from './list-form';

/**
 * Style dependencies
 */
import './style.scss';

function ReaderListCreate() {
	const dispatch = useDispatch();
	const translate = useTranslate();
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
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isUpdatingList = useSelector( isUpdatingListSelector );
	const list = useSelector( ( state ) => getListByOwnerAndSlug( state, props.owner, props.slug ) );
	const listItems = useSelector( ( state ) =>
		list ? getListItems( state, list.ID ) : undefined
	);
	return (
		<>
			{ ! list && <QueryReaderList owner={ props.owner } slug={ props.slug } /> }
			{ ! listItems && list && <QueryReaderListItems owner={ props.owner } slug={ props.slug } /> }
			<Main>
				<FormattedHeader
					headerText={ translate( 'Manage %(listName)s', {
						args: { listName: list?.title || props.slug },
					} ) }
				/>
				{ ! list && <Card>Loading...</Card> }
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

								{ listItems && (
									<NavItem
										selected={ selectedSection === 'export' }
										path={ `/read/list/${ props.owner }/${ props.slug }/export` }
									>
										{ translate( 'Export' ) }
									</NavItem>
								) }
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && (
							<>
								<ListForm
									list={ list }
									isSubmissionDisabled={ isUpdatingList }
									onSubmit={ ( formList ) => dispatch( updateReaderList( formList ) ) }
								/>

								<Card>
									<FormSectionHeading>DANGER!!</FormSectionHeading>
									<Button scary primary>
										DELETE LIST FOREVER
									</Button>
								</Card>
							</>
						) }
						{ selectedSection === 'items' &&
							listItems?.map( ( item ) => (
								<ListItem key={ item.ID } owner={ props.owner } list={ list } item={ item } />
							) ) }

						{ selectedSection === 'export' && (
							<Card>
								<p>
									{ translate(
										'You can export this list to use on other services. The file will be in OPML format.'
									) }
								</p>
								<ReaderExportButton
									exportType={ READER_EXPORT_TYPE_LIST }
									listId={ list.ID }
									filename={ `reader-list-${ props.slug
										.replace( /[^a-z0-9]/gi, '_' )
										.toLowerCase() }.opml` }
								/>
							</Card>
						) }
					</>
				) }
			</Main>
		</>
	);
}

export default function ReaderListManage( props ) {
	return props.isCreateForm ? ReaderListCreate() : ReaderListEdit( props );
}
