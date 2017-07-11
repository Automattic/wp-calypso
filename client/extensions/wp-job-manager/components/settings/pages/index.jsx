/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormSection, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import PageDropdown from './page-dropdown';
import QueryPages from '../../data/query-pages';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPages } from '../../../state/settings/selectors';

class Pages extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	render() {
		const { pages, siteId, translate } = this.props;

		return (
			<div>
				<QueryPages siteId={ siteId } />

				<form>
					<FormSection name="pages">
						<SectionHeader label={ translate( 'Pages' ) }>
							<FormButton compact />
						</SectionHeader>
						<Card>
							<FormFieldset>
								<FormLabel>
									{ translate( 'Submit Job Form Page' ) }
								</FormLabel>
								<PageDropdown name="submitFormPage" pages={ pages } />
								<FormSettingExplanation>
									{ translate( 'Select the page where you have placed the [submit_job_form] shortcode. ' +
										'This lets the plugin know where the form is located.' ) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<FormLabel>
									{ translate( 'Job Dashboard Page' ) }
								</FormLabel>
								<PageDropdown name="dashboardPage" pages={ pages } />
								<FormSettingExplanation>
									{ translate( 'Select the page where you have placed the [job_dashboard] shortcode. ' +
										'This lets the plugin know where the dashboard is located.' ) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<FormLabel>
									{ translate( 'Job Listings Page' ) }
								</FormLabel>
								<PageDropdown name="listingsPage" pages={ pages } />
								<FormSettingExplanation>
									{ translate( 'Select the page where you have placed the [jobs] shortcode. ' +
										'This lets the plugin know where the job listings page is located.' ) }
								</FormSettingExplanation>
							</FormFieldset>
						</Card>
					</FormSection>
				</form>
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			pages: getPages( state, siteId ),
			siteId,
		};
	}
);

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form: 'pages',
	getFormState: state => state.extensions.wpJobManager.form,
} );

export default flowRight(
	connectComponent,
	localize,
	createReduxForm,
)( Pages );
