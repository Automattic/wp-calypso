/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormSection, isDirty, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { ProtectFormGuard } from 'lib/protect-form';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import PageDropdown from './page-dropdown';
import QueryPosts from 'components/data/query-posts';
import SectionHeader from 'components/section-header';
import { isRequestingSitePostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const form = 'extensions.wpJobManager.pages';
const query = { type: 'page' };

class Pages extends Component {
	static propTypes = {
		dirty: PropTypes.bool,
		handleSubmit: PropTypes.func,
		isFetching: PropTypes.bool,
		isFetchingPages: PropTypes.bool,
		onSubmit: PropTypes.func,
		siteId: PropTypes.number,
		submitting: PropTypes.bool,
		translate: PropTypes.func,
	};

	save = section => data => this.props.onSubmit( form, data[ section ] );

	render() {
		const {
			dirty,
			handleSubmit,
			isFetching,
			isFetchingPages,
			siteId,
			submitting,
			translate,
		} = this.props;

		const isDisabled = isFetching || isFetchingPages || submitting;

		return (
			<div>
				{ siteId &&
					<QueryPosts siteId={ siteId } query={ query } />
				}

				<form>
					<ProtectFormGuard isChanged={ dirty } />

					<FormSection name="pages">
						<SectionHeader label={ translate( 'Pages' ) }>
							<FormButton compact
								disabled={ isDisabled }
								isSubmitting={ submitting }
								onClick={ handleSubmit( this.save( 'pages' ) ) } />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<FormLabel htmlFor="submitFormPage">
									{ translate( 'Submit Job Form Page' ) }
								</FormLabel>
								<FormSettingExplanation>
									{ translate( 'Select the page where you\'ve used the [submit_job_form] shortcode. ' +
										'This lets the plugin know the location of the form.' ) }
								</FormSettingExplanation>
								<PageDropdown
									disabled={ isDisabled }
									id="submitFormPage"
									name="submitFormPage" />
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="dashboardPage">
									{ translate( 'Job Dashboard Page' ) }
								</FormLabel>
								<FormSettingExplanation>
									{ translate( 'Select the page where you\'ve used the [job_dashboard] shortcode. ' +
										'This lets the plugin know the location of the dashboard.' ) }
								</FormSettingExplanation>
								<PageDropdown
									disabled={ isDisabled }
									id="dashboardPage"
									name="dashboardPage" />
							</FormFieldset>

							<FormFieldset>
								<FormLabel htmlFor="listingsPage">
									{ translate( 'Job Listings Page' ) }
								</FormLabel>
								<FormSettingExplanation>
									{ translate( 'Select the page where you\'ve used the [jobs] shortcode. ' +
										'This lets the plugin know the location of the job listings page.' ) }
								</FormSettingExplanation>
								<PageDropdown
									disabled={ isDisabled }
									id="listingsPage"
									name="listingsPage" />
							</FormFieldset>
						</Card>
					</FormSection>
				</form>
			</div>
		);
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			dirty: isDirty( form ),
			isFetchingPages: isRequestingSitePostsForQuery( state, siteId, query ),
			siteId,
		};
	}
);

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
} );

export default flowRight(
	connectComponent,
	localize,
	createReduxForm,
)( Pages );
