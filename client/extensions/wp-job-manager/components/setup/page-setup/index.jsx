/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import { Steps } from '../constants';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import ReduxFormTextInput from 'components/redux-forms/redux-form-text-input';
import ReduxFormToggle from 'components/redux-forms/redux-form-toggle';
import SectionHeader from 'components/section-header';
import { createPages } from '../../../state/setup/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isCreatingPages, shouldGoToNextStep } from '../../../state/setup/selectors';

const form = 'extensions.wpJobManager.pageSetup';

class PageSetup extends Component {
	static propTypes = {
		createDashboard: PropTypes.bool,
		createJobs: PropTypes.bool,
		createPages: PropTypes.func.isRequired,
		createPostJob: PropTypes.bool,
		dashboardTitle: PropTypes.string,
		goToNextStep: PropTypes.bool,
		isCreating: PropTypes.bool,
		jobsTitle: PropTypes.string,
		postJobTitle: PropTypes.string,
		siteId: PropTypes.number,
		slug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	componentWillReceiveProps( { goToNextStep, slug } ) {
		if ( ! goToNextStep ) {
			return;
		}

		page( `/extensions/wp-job-manager/setup/${ slug }/${ Steps.CONFIRMATION }` );
	}

	createSelectedPages = () => {
		const titles = [];
		const {
			createDashboard,
			createJobs,
			createPostJob,
			dashboardTitle,
			jobsTitle,
			postJobTitle,
			siteId,
		} = this.props;

		if ( ! siteId ) {
			return;
		}

		createPostJob && postJobTitle.trim() && titles.push( postJobTitle.trim() );
		createDashboard && dashboardTitle.trim() && titles.push( dashboardTitle.trim() );
		createJobs && jobsTitle.trim() && titles.push( jobsTitle.trim() );

		if ( titles.length === 0 ) {
			return;
		}

		this.props.createPages( siteId, titles );
	}

	render() {
		const {
			createDashboard,
			createJobs,
			createPostJob,
			isCreating,
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
									disabled={ isCreating }
									name="createPostJob" />
								<ReduxFormTextInput
									disabled={ ! createPostJob || isCreating }
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
									disabled={ isCreating }
									name="createDashboard" />
								<ReduxFormTextInput
									disabled={ ! createDashboard || isCreating }
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
									disabled={ isCreating }
									name="createJobs" />
								<ReduxFormTextInput
									disabled={ ! createJobs || isCreating }
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
						disabled={ ( ! createPostJob && ! createDashboard && ! createJobs ) || isCreating }
						onClick={ this.createSelectedPages }>
						{ translate( 'Create selected pages' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

const selector = formValueSelector( form );

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		...selector( state, 'createDashboard', 'createJobs', 'createPostJob', 'dashboardTitle', 'jobsTitle', 'postJobTitle' ),
		goToNextStep: shouldGoToNextStep( state, siteId ),
		isCreating: isCreatingPages( state, siteId ),
		siteId,
		slug: getSelectedSiteSlug( state ) || '',
	};
};

const mapDispatchToProps = { createPages };

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
	connect( mapStateToProps, mapDispatchToProps ),
	createReduxForm,
	localize,
)( PageSetup );
