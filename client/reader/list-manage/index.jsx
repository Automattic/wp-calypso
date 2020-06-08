/**
 * External dependencies
 */
import * as React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
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
import ListItem from './list-item';
import './style.scss';

function ReaderListEdit( props ) {
	const { list, listItems } = props;
	const [ selectedSection, setSelectedSection ] = React.useState( 'details' );
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
									onClick={ () => setSelectedSection( 'details' ) }
								>
									Details
								</NavItem>
								<NavItem
									selected={ selectedSection === 'sites' }
									count={ listItems?.length }
									onClick={ () => setSelectedSection( 'sites' ) }
								>
									Sites
								</NavItem>
							</NavTabs>
						</SectionNav>
						{ selectedSection === 'details' && (
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
											Don't worry, posts from private sites will only appear to those with access.
											Adding a private site to a public list will not make posts from that site
											accessible to everyone.
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
									<Button scary primary>
										DELETE LIST FOREVER
									</Button>
								</Card>
							</>
						) }
						{ selectedSection === 'sites' &&
							props.listItems?.map( ( item ) => <ListItem key={ item.ID } item={ item } /> ) }
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
} )( ReaderListEdit );
