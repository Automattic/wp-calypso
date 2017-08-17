/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';

class PageSetup extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	state = {
		dashboard: true,
		dashboardPage: this.props.translate( 'Job Dashboard' ),
		jobs: true,
		jobsPage: this.props.translate( 'Jobs' ),
		postJob: true,
		postJobPage: this.props.translate( 'Post a Job' ),
	}

	updateText = name => event => this.setState( { [ name ]: event.target.value } );

	updateToggle = name => () => this.setState( { [ name ]: ! this.state[ name ] } );

	render() {
		const { translate } = this.props;
		const {
			dashboard,
			dashboardPage,
			jobs,
			jobsPage,
			postJob,
			postJobPage,
		} = this.state;

		return (
			<div>
				<SectionHeader label={ translate( 'Page Setup' ) } />
				<Card>
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
								<CompactFormToggle
									checked={ postJob }
									onChange={ this.updateToggle( 'postJob' ) }>
									<FormTextInput
										disabled={ ! postJob }
										onChange={ this.updateText( 'postJobPage' ) }
										value={ postJobPage } />
								</CompactFormToggle>

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
								<CompactFormToggle
									checked={ dashboard }
									onChange={ this.updateToggle( 'dashboard' ) }>
									<FormTextInput
										disabled={ ! dashboard }
										onChange={ this.updateText( 'dashboardPage' ) }
										value={ dashboardPage } />
								</CompactFormToggle>

								<FormSettingExplanation>
									{ translate(
										'This page allows employers to manage and edit their own jobs from the front-end. ' +
										'If you plan on managing all listings from the admin dashboard, you can skip creating ' +
										'this page. Alternatively, you can add the [job_dashboard] shortcode to an existing page.'
									) }
								</FormSettingExplanation>
							</FormFieldset>

							<FormFieldset>
								<CompactFormToggle
									checked={ jobs }
									onChange={ this.updateToggle( 'jobs' ) }>
									<FormTextInput
										disabled={ ! jobs }
										onChange={ this.updateText( 'jobsPage' ) }
										value={ jobsPage } />
								</CompactFormToggle>

								<FormSettingExplanation>
									{ translate(
										'This page allows users to browse, search, and filter job listings on the front-end ' +
										'of your site. Alternatively, you can add the [jobs] shortcode to an existing page.'
									) }
								</FormSettingExplanation>
							</FormFieldset>
						</form>
					</div>

					<Button compact primary>
						{ translate( 'Create selected pages' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( PageSetup );
