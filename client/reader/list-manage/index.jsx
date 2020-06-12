/**
 * External dependencies
 */
import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card, Dialog } from '@automattic/components';
import { deleteReaderList } from 'state/reader/lists/actions';
import { getListByOwnerAndSlug, getListItems } from 'state/reader/lists/selectors';
import FormattedHeader from 'components/formatted-header';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import QueryReaderList from 'components/data/query-reader-list';
import QueryReaderListItems from 'components/data/query-reader-list-items';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Main from 'components/main';
import ReaderExportButton from 'blocks/reader-export-button';
import ListItem from './list-item';
import { READER_EXPORT_TYPE_LIST } from 'blocks/reader-export-button/constants';

/**
 * Style dependencies
 */
import './style.scss';

function Details( { deleteState, setDeleteState, list } ) {
	const dispatch = useDispatch();

	return (
		<>
			{ deleteState === '' && (
				<>
					<Card>
						<FormSectionHeading>List Details</FormSectionHeading>

						<FormFieldset>
							<FormLabel htmlFor="list-name">Name</FormLabel>
							<FormTextInput id="list-name" name="list-name" value={ list.title } />
							<FormSettingExplanation>The name of the list.</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="list-slug">Slug</FormLabel>
							<FormTextInput id="list-slug" name="list-slug" value={ list.slug } />
							<FormSettingExplanation>
								The slug for the list. This is used to build the URL to the list.
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLegend>Visibility</FormLegend>
							<FormLabel>
								<FormRadio value="public" checked={ list.is_public } />
								<span>Everyone can view this list</span>
							</FormLabel>

							<FormLabel>
								<FormRadio value="private" checked={ ! list.is_public } />
								<span>Only I can view this list</span>
							</FormLabel>
							<FormSettingExplanation>
								Don't worry, posts from private sites will only appear to those with access. Adding
								a private site to a public list will not make posts from that site accessible to
								everyone.
							</FormSettingExplanation>
						</FormFieldset>

						<FormFieldset>
							<FormLabel htmlFor="list-description">Description</FormLabel>
							<FormTextarea
								name="list-description"
								id="list-description"
								placeholder="What's your list about?"
								value={ list.description }
							/>
						</FormFieldset>
						<FormButtonsBar>
							<FormButton primary>Save</FormButton>
						</FormButtonsBar>
					</Card>

					<Card>
						<FormSectionHeading>DANGER!!</FormSectionHeading>
						<Button scary primary onClick={ () => setDeleteState( 'confirming' ) }>
							DELETE LIST FOREVER
						</Button>
					</Card>
				</>
			) }
			{ deleteState === 'confirming' && (
				<Dialog
					isVisible={ true }
					buttons={ [
						{ action: 'cancel', label: 'Keep it!' },
						{ action: 'delete', label: 'Delete List', isPrimary: true },
					] }
					onClose={ ( action ) => {
						if ( action === 'delete' ) {
							dispatch( deleteReaderList( list.ID, list.owner, list.slug ) );
							// redirect to /read
						}
						setDeleteState( 'deleted' );
					} }
				>
					<h1>Are you sure you want to delete this list?</h1>
					<p>This action cannot be undone.</p>
				</Dialog>
			) }
			{ deleteState === 'deleted' && (
				<Card>
					<FormSectionHeading>This list has been deleted</FormSectionHeading>
				</Card>
			) }
		</>
	);
}

function Items( { list, listItems, owner } ) {
	if ( ! listItems ) {
		return <Card>Loading...</Card>;
	}
	return listItems.map( ( item ) => (
		<ListItem key={ item.ID } owner={ owner } list={ list } item={ item } />
	) );
}

function Export( { list, listItems } ) {
	return (
		<Card>
			<p>You can export this list to use on other services. The file will be in OPML format.</p>
			<ReaderExportButton
				exportType={ READER_EXPORT_TYPE_LIST }
				listId={ list.ID }
				disabled={ ! listItems || listItems.length === 0 }
			/>
		</Card>
	);
}

function ReaderListEdit( props ) {
	const { list, listItems, selectedSection, translate } = props;
	const [ deleteState, setDeleteState ] = React.useState( '' );
	return (
		<>
			{ ! list && <QueryReaderList owner={ props.owner } slug={ props.slug } /> }
			{ ! listItems && list && <QueryReaderListItems owner={ props.owner } slug={ props.slug } /> }
			<Main>
				<FormattedHeader headerText={ `Manage ${ list?.title || props.slug }` } />
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

								<NavItem
									selected={ selectedSection === 'export' }
									path={ `/read/list/${ props.owner }/${ props.slug }/export` }
								>
									{ translate( 'Export' ) }
								</NavItem>
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && (
							<Details deleteState={ deleteState } setDeleteState={ setDeleteState } { ...props } />
						) }
						{ selectedSection === 'items' && <Items { ...props } /> }
						{ selectedSection === 'export' && <Export { ...props } /> }
					</>
				) }
			</Main>
		</>
	);
}

export default connect( ( state, ownProps ) => {
	const list = getListByOwnerAndSlug( state, ownProps.owner, ownProps.slug );
	const listItems = list ? getListItems( state, list.ID ) : undefined;
	return {
		list,
		listItems,
	};
} )( localize( ReaderListEdit ) );
