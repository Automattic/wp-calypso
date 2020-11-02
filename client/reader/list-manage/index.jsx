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
	isMissingByOwnerAndSlug,
} from 'calypso/state/reader/lists/selectors';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import QueryReaderListItems from 'calypso/components/data/query-reader-list-items';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import Main from 'calypso/components/main';
import { createReaderList } from 'calypso/state/reader/lists/actions';
import ReaderExportButton from 'calypso/blocks/reader-export-button';
import { READER_EXPORT_TYPE_LIST } from 'calypso/blocks/reader-export-button/constants';
import ListItem from './list-item';
import Missing from 'calypso/reader/list-stream/missing';

/**
 * Style dependencies
 */
import './style.scss';

function ListForm( { isCreateForm, isSubmissionDisabled, list, onChange, onSubmit } ) {
	const translate = useTranslate();
	const isNameValid = typeof list.title === 'string' && list.title.length > 0;
	const isSlugValid = isCreateForm || ( typeof list.slug === 'string' && list.slug.length > 0 );
	return (
		<Card>
			<FormFieldset>
				<FormLabel htmlFor="list-name">{ translate( 'Name (Required)' ) }</FormLabel>
				<FormTextInput
					data-key="title"
					id="list-name"
					isValid={ isNameValid }
					name="list-name"
					onChange={ onChange }
					value={ list.title }
				/>
				<FormSettingExplanation>{ translate( 'The name of the list.' ) }</FormSettingExplanation>
			</FormFieldset>

			{ ! isCreateForm && (
				<FormFieldset>
					<FormLabel htmlFor="list-slug">{ translate( 'Slug (Required)' ) }</FormLabel>
					<FormTextInput
						data-key="slug"
						id="list-slug"
						isValid={ isSlugValid }
						name="list-slug"
						onChange={ onChange }
						value={ list.slug }
					/>
					<FormSettingExplanation>
						{ translate( 'The slug for the list. This is used to build the URL to the list.' ) }
					</FormSettingExplanation>
				</FormFieldset>
			) }

			<FormFieldset>
				<FormLegend>{ translate( 'Visibility' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						checked={ list.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="public"
					/>
					<span>{ translate( 'Everyone can view this list' ) }</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						checked={ ! list.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="private"
					/>
					<span>{ translate( 'Only I can view this list' ) }</span>
				</FormLabel>
				<FormSettingExplanation>
					{ translate(
						"Don't worry, posts from private sites will only appear to those with access. " +
							'Adding a private site to a public list will not make posts from that site accessible to everyone.'
					) }
				</FormSettingExplanation>
			</FormFieldset>

			<FormFieldset>
				<FormLabel htmlFor="list-description">{ translate( 'Description' ) }</FormLabel>
				<FormTextarea
					data-key="description"
					id="list-description"
					name="list-description"
					onChange={ onChange }
					placeholder={ translate( "What's your list about?" ) }
					value={ list.description }
				/>
			</FormFieldset>
			<FormButtonsBar>
				<FormButton
					primary
					disabled={ isSubmissionDisabled || ! isNameValid || ! isSlugValid }
					onClick={ onSubmit }
				>
					{ translate( 'Save' ) }
				</FormButton>
			</FormButtonsBar>
		</Card>
	);
}

function Details( { list } ) {
	const translate = useTranslate();
	return (
		<>
			<ListForm list={ list } />

			<Card>
				<FormSectionHeading>{ translate( 'DANGER!!' ) }</FormSectionHeading>
				<Button scary primary>
					{ translate( 'DELETE LIST FOREVER' ) }
				</Button>
			</Card>
		</>
	);
}

function Items( { list, listItems, owner } ) {
	const translate = useTranslate();
	if ( ! listItems ) {
		return <Card>{ translate( 'Loading…' ) }</Card>;
	}
	return listItems.map( ( item ) => (
		<ListItem key={ item.ID } owner={ owner } list={ list } item={ item } />
	) );
}

function Export( { list, listItems } ) {
	const translate = useTranslate();
	return (
		<Card>
			<p>You can export this list to use on other services. The file will be in OPML format.</p>
			{ ! listItems && <span>{ translate( 'Loading…' ) }</span> }
			{ listItems && (
				<ReaderExportButton exportType={ READER_EXPORT_TYPE_LIST } listId={ list.ID } />
			) }
		</Card>
	);
}

function ReaderListCreate() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isCreatingList = useSelector( isCreatingListSelector );
	const [ list, updateList ] = React.useState( {
		description: '',
		is_public: true,
		slug: '',
		title: '',
	} );
	const onChange = ( event ) => {
		const update = { [ event.target.dataset.key ]: event.target.value };
		if ( 'is_public' in update ) {
			update.is_public = update.is_public === 'public';
		}
		updateList( { ...list, ...update } );
	};
	return (
		<Main>
			<FormattedHeader headerText={ translate( 'Create List' ) } />
			<ListForm
				isCreateForm
				isSubmissionDisabled={ isCreatingList }
				list={ list }
				onChange={ onChange }
				onSubmit={ () => dispatch( createReaderList( list ) ) }
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
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && <Details { ...sectionProps } /> }
						{ selectedSection === 'items' && <Items { ...sectionProps } /> }
						{ selectedSection === 'export' && <Export { ...sectionProps } /> }
					</>
				) }
			</Main>
		</>
	);
}

export default function ReaderListManage( props ) {
	return props.isCreateForm ? ReaderListCreate() : ReaderListEdit( props );
}
