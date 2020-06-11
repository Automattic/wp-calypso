/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import {
	getListByOwnerAndSlug,
	getListItems,
	isCreatingList as isCreatingListSelector,
} from 'state/reader/lists/selectors';
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
import { createReaderList } from 'state/reader/lists/actions';
import ListItem from './list-item';
import './style.scss';

function ListForm( { isCreateForm, isSubmissionDisabled, list, onChange, onSubmit } ) {
	const isNameValid = typeof list.title === 'string' && list.title.length > 0;
	const isSlugValid = isCreateForm || ( typeof list.slug === 'string' && list.slug.length > 0 );
	return (
		<Card>
			<FormFieldset>
				<FormLabel htmlFor="list-name">Name (Required)</FormLabel>
				<FormTextInput
					data-key="title"
					id="list-name"
					isValid={ isNameValid }
					name="list-name"
					onChange={ onChange }
					value={ list.title }
				/>
				<FormSettingExplanation>The name of the list.</FormSettingExplanation>
			</FormFieldset>

			{ ! isCreateForm && (
				<FormFieldset>
					<FormLabel htmlFor="list-slug">Slug (Required)</FormLabel>
					<FormTextInput
						data-key="slug"
						id="list-slug"
						isValid={ isSlugValid }
						name="list-slug"
						onChange={ onChange }
						value={ list.slug }
					/>
					<FormSettingExplanation>
						The slug for the list. This is used to build the URL to the list.
					</FormSettingExplanation>
				</FormFieldset>
			) }

			<FormFieldset>
				<FormLegend>Visibility</FormLegend>
				<FormLabel>
					<FormRadio
						checked={ list.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="public"
					/>
					<span>Everyone can view this list</span>
				</FormLabel>

				<FormLabel>
					<FormRadio
						checked={ ! list.is_public }
						data-key="is_public"
						onChange={ onChange }
						value="private"
					/>
					<span>Only I can view this list</span>
				</FormLabel>
				<FormSettingExplanation>
					Don't worry, posts from private sites will only appear to those with access. Adding a
					private site to a public list will not make posts from that site accessible to everyone.
				</FormSettingExplanation>
			</FormFieldset>

			<FormFieldset>
				<FormLabel htmlFor="list-description">Description</FormLabel>
				<FormTextarea
					data-key="description"
					id="list-description"
					name="list-description"
					onChange={ onChange }
					placeholder="What's your list about?"
					value={ list.description }
				/>
			</FormFieldset>
			<FormButtonsBar>
				<FormButton
					primary
					disabled={ isSubmissionDisabled || ! isNameValid || ! isSlugValid }
					onClick={ onSubmit }
				>
					Save
				</FormButton>
			</FormButtonsBar>
		</Card>
	);
}

function ReaderListCreate() {
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
			<FormattedHeader headerText="Create List" />
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
	const list = useSelector( ( state ) => getListByOwnerAndSlug( state, props.owner, props.slug ) );
	const listItems = useSelector( ( state ) =>
		list ? getListItems( state, list.ID ) : undefined
	);

	const selectedSection = props.showItems ? 'items' : 'details';
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
									Details
								</NavItem>
								<NavItem
									selected={ selectedSection === 'items' }
									count={ listItems?.length }
									path={ `/read/list/${ props.owner }/${ props.slug }/edit/items` }
								>
									Sites
								</NavItem>
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && (
							<>
								<ListForm list={ list } />

								<Card>
									<FormSectionHeading>DANGER!!</FormSectionHeading>
									<Button scary primary>
										DELETE LIST FOREVER
									</Button>
								</Card>
							</>
						) }
						{ selectedSection === 'items' &&
							listItems?.map( ( item ) => <ListItem key={ item.ID } item={ item } /> ) }
					</>
				) }
			</Main>
		</>
	);
}

export default function ReaderListManage( props ) {
	return props.isCreateForm ? ReaderListCreate() : ReaderListEdit( props );
}
