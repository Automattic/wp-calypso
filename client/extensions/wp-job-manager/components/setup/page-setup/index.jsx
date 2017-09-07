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
					{ translate(
						'{{p}}With WP Job Manager, employers and applicants can post, manage, and browse job listings ' +
						'right on your website. Tell us which of these common pages you\'d like your site to have ' +
						'and we\'ll create and configure them for you.{{/p}}' +
						'{{p}}(These pages are created using {{shortcodes}}shortcodes{{/shortcodes}}, which we take care of ' +
						'in this step. If you\'d like to build these pages yourself or want to add one of these options to an ' +
						'existing page on your site, you can skip this step and take a look at {{shortcodeRef}}shortcode ' +
						'support documentation{{/shortcodeRef}} for detailed instructions.){{/p}}',
						{ components: {
							em: <em />,
							p: <p />,
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
										'Creates a page that allows employers to post new jobs directly from a page on your website, ' +
										'instead of requiring them to log in to an admin area. If you\'d rather not allow this -- ' +
										'for example, if you want employers to use the admin dashboard only -- you can uncheck ' +
										'this setting.'
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
										'Creates a page that allows employers to manage their job listings directly from a page on your ' +
										'website, instead of requiring them to log in to an admin area. If you want to manage all ' +
										'job listings from the admin dashboard only, you can uncheck this setting.'
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
										'Creates a page where visitors can browse, search, and filter job listings.'
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

const mapStateToProps = state => selector( state, 'createDashboard', 'createJobs', 'createPostJob' );

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
