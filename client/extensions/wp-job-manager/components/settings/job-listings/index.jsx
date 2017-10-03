/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormSection, formValueSelector, isDirty, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { ProtectFormGuard } from 'lib/protect-form';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ReduxFormRadio from 'components/redux-forms/redux-form-radio';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import ReduxFormToggle from 'components/redux-forms/redux-form-toggle';
import SectionHeader from 'components/section-header';

const form = 'extensions.wpJobManager.jobListings';

class JobListings extends Component {
	static propTypes = {
		dirty: PropTypes.bool,
		handleSubmit: PropTypes.func,
		isFetching: PropTypes.bool,
		onSubmit: PropTypes.func,
		submitting: PropTypes.bool,
		translate: PropTypes.func,
	};

	save = section => data => this.props.onSubmit( form, data[ section ] );

	render() {
		const {
			dirty,
			handleSubmit,
			isFetching,
			perPage,
			submitting,
			translate,
		} = this.props;
		const isDisabled = isFetching || submitting;

		return (
			<div>
				<form>
					<ProtectFormGuard isChanged={ dirty } />

					<FormSection name="listings">
						<SectionHeader label={ translate( 'Listings' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'listings' ) ) } />
						</SectionHeader>
						<Card>
							<p>
								{ translate(
									'Display {{listings /}} job listing per page',
									'Display {{listings /}} job listings per page',
									{
										count: perPage,
										components: {
											listings:
												<ReduxFormTextInput
													disabled={ isDisabled }
													min="0"
													name="perPage"
													step="1"
													type="number" />
										}
									}
								) }
							</p>

							<FormFieldset>
								<ReduxFormToggle
									disabled={ isDisabled }
									name="hideFilledPositions"
									text={ translate( 'Hide filled positions' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'Filled positions will not display in your archives.' ) }
								</FormSettingExplanation>

								<ReduxFormToggle
									disabled={ isDisabled }
									name="hideExpired"
									text={ translate( 'Hide expired listings in job archives/search' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'Expired job listings will not be searchable.' ) }
								</FormSettingExplanation>

								<ReduxFormToggle
									disabled={ isDisabled }
									name="hideExpiredContent"
									text={ translate( 'Hide content in expired single job listings' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'Your site will display the titles of expired listings, but not the ' +
										'content of the listings. Otherwise, expired listings display their full content ' +
										'minus the application area.' ) }
								</FormSettingExplanation>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>

				<form>
					<FormSection name="categories">
						<SectionHeader label={ translate( 'Categories' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'categories' ) ) } />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<ReduxFormToggle
									disabled={ isDisabled }
									name="enableCategories"
									text={ translate( 'Enable listing categories' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'This lets users select from a list of categories when submitting a ' +
										'job. Note: an admin has to create categories before site users can select them.' ) }
								</FormSettingExplanation>

								<ReduxFormToggle
									disabled={ isDisabled }
									name="enableDefaultCategory"
									text={ translate( 'Default to category multiselect' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'The category selection box will default to allowing multiple ' +
										'selections on the [jobs] shortcode. Without this, users will only be able to ' +
										'select a single category when submitting jobs.' ) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<FormLabel>
									{ translate( 'Category Filter Type' ) }
								</FormLabel>
								<FormSettingExplanation>
									{ translate( 'Determines the logic used to display jobs when selecting multiple categories.' ) }
								</FormSettingExplanation>
								<FormLabel>
									<ReduxFormRadio
										disabled={ isDisabled }
										name="categoryFilterType"
										value="any" />
									<span>
										{ translate( 'Jobs will be shown if within ANY selected category' ) }
									</span>
								</FormLabel>

								<FormLabel>
									<ReduxFormRadio
										disabled={ isDisabled }
										name="categoryFilterType"
										value="all" />
									<span>
										{ translate( 'Jobs will be shown if within ALL selected categories' ) }
									</span>
								</FormLabel>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>

				<form>
					<FormSection name="types">
						<SectionHeader label={ translate( 'Types' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'types' ) ) } />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<ReduxFormToggle
									disabled={ isDisabled }
									name="enableTypes"
									text={ translate( 'Enable listing types' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'This lets users select from a list of types when submitting a job. ' +
										'Note: an admin has to create types before site users can select them.' ) }
								</FormSettingExplanation>

								<ReduxFormToggle
									disabled={ isDisabled }
									name="multiJobType"
									text={ translate( 'Allow multiple types for listings' ) } />
								<FormSettingExplanation isIndented>
									{ translate( 'This allows users to select more than one type when submitting a job. ' +
										'The metabox on the post editor and the selection box on the front-end job ' +
										'submission form will both reflect this.' ) }
								</FormSettingExplanation>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>

				<form>
					<FormSection name="format">
						<SectionHeader label={ translate( 'Date Format' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'format' ) ) } />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<FormSettingExplanation>
									{ translate( 'Choose how you want the published date for jobs to be displayed on the front-end.' ) }
								</FormSettingExplanation>
								<FormLabel>
									<ReduxFormRadio
										disabled={ isDisabled }
										name="dateFormat"
										value="relative" />
									<span>
										{ translate( 'Relative to the current date (e.g., 1 day, 1 week, 1 month ago)' ) }
									</span>
								</FormLabel>

								<FormLabel>
									<ReduxFormRadio
										disabled={ isDisabled }
										name="dateFormat"
										value="default" />
									<span>
										{ translate( 'Default date format as defined in Settings' ) }
									</span>
								</FormLabel>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>

				<form>
					<FormSection name="apiKey">
						<SectionHeader label={ translate( 'Google Maps API Key' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'apiKey' ) ) } />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<ReduxFormTextInput
									disabled={ isDisabled }
									name="googleMapsApiKey" />
								<FormSettingExplanation>
									{ translate(
										'Google requires an API key to retrieve location information for job listings. ' +
										'Acquire an API key from the {{a}}Google Maps API developer site{{/a}}.',
										{
											components: {
												a: (
													<ExternalLink
														icon={ true }
														target="_blank"
														href="https://developers.google.com/maps/documentation/geocoding/get-api-key"
													/>
												),
											}
										}
									) }
								</FormSettingExplanation>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>
			</div>
		);
	}
}

const selector = formValueSelector( form );

const connectComponent = connect(
	state => ( {
		dirty: isDirty( form ),
		perPage: selector( state, 'listings.perPage' ),
	} )
);

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
} );

export default flowRight(
	connectComponent,
	localize,
	createReduxForm,
)( JobListings );
