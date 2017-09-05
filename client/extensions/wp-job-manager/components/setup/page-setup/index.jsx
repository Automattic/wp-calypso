/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import ReduxFormToggle from 'components/redux-forms/redux-form-toggle';
import SectionHeader from 'components/section-header';

const form = 'extensions.wpJobManager.pageSetup';

class PageSetup extends Component {
	static propTypes = {
		createDashboard: PropTypes.bool,
		createJobs: PropTypes.bool,
		createPostJob: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			createDashboard,
			createJobs,
			createPostJob,
			translate,
		} = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Page Setup' ) } />
				<CompactCard>
					<p>
						{ translate(
							'{{em}}WP Job Manager{{/em}} includes {{shortcodes}}shortcodes{{/shortcodes}} which can ' +
							'be used within your {{pages}}pages{{/pages}} to output content. These can be created ' +
							'for you below. For more information on the job shortcodes view the ' +
							'{{shortcodeRef}}shortcode documentation{{/shortcodeRef}}.',
							{ components: {
								em: <em />,
								pages: (
									<ExternalLink
										icon={ true }
										target="_blank"
										href="https://codex.wordpress.org/Pages"
									/>
								),
								shortcodes: (
									<ExternalLink
										icon={ true }
										target="_blank"
										href="https://codex.wordpress.org/Shortcode"
									/>
								),
								shortcodeRef: (
									<ExternalLink
										icon={ true }
										target="_blank"
										href="https://wpjobmanager.com/document/shortcode-reference/"
									/>
								)
							} }
						) }
					</p>

					<div className="page-setup__pages">
						<form>
							<FormFieldset>
								<ReduxFormToggle
									name="createPostJob" />
								<ReduxFormTextInput
									disabled={ ! createPostJob }
									name="postJobTitle" />

								<FormSettingExplanation>
									{ translate(
										'This page allows employers to post jobs to your website from the front-end. ' +
										'If you do not want to accept submissions from users in this way (for example, you ' +
										'just want to post jobs from the admin dashboard), you can skip creating this page. ' +
										'Alternatively, you can add the [submit_job_form] shortcode to an existing page.'
									) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<ReduxFormToggle
									name="createDashboard" />
								<ReduxFormTextInput
									disabled={ ! createDashboard }
									name="dashboardTitle" />

								<FormSettingExplanation>
									{ translate(
										'This page allows employers to manage and edit their own jobs from the front-end. ' +
										'If you plan on managing all listings from the admin dashboard, you can skip creating ' +
										'this page. Alternatively, you can add the [job_dashboard] shortcode to an existing page.'
									) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<ReduxFormToggle
									name="createJobs" />
								<ReduxFormTextInput
									disabled={ ! createJobs }
									name="jobsTitle" />

								<FormSettingExplanation>
									{ translate(
										'This page allows users to browse, search, and filter job listings on the front-end ' +
										'of your site. Alternatively, you can add the [jobs] shortcode to an existing page.'
									) }
								</FormSettingExplanation>
							</FormFieldset>
						</form>
					</div>
				</CompactCard>

				<CompactCard>
					<a
						className="page-setup__skip"
						href="#">
						{ translate( 'Skip this step' ) }
					</a>
					<Button primary
						className="page-setup__create-pages"
						disabled={ ( ! createPostJob && ! createDashboard && ! createJobs ) }>
						{ translate( 'Create selected pages' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

const selector = formValueSelector( form );

const mapStateToProps = state => {
	return {
		createDashboard: selector( state, 'createDashboard' ),
		createJobs: selector( state, 'createJobs' ),
		createPostJob: selector( state, 'createPostJob' ),
	};
};

const createReduxForm = reduxForm( {
	form,
	initialValues: {
		createDashboard: true,
		createJobs: true,
		createPostJob: true,
		dashboardTitle: 'Job Dashboard',
		jobsTitle: 'Jobs',
		postJobTitle: 'Post a Job',
	}
} );

export default compose(
	connect( mapStateToProps ),
	createReduxForm,
	localize,
)( PageSetup );
