/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

/**
 * Internal dependencies
 */
import { createPages } from '../../../state/setup/actions';
import { isCreatingPages, shouldGoToNextStep } from '../../../state/setup/selectors';
import { SetupPath, Steps } from '../constants';
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import ReduxFormToggle from 'components/redux-forms/redux-form-toggle';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const form = 'extensions.wpJobManager.pageSetup';

const validate = ( values, { translate } ) => {
	const errors = {};
	const message = translate( 'Page name cannot be empty.' );

	if ( values.createPostJob && ! values.postJobTitle.trim() ) {
		errors.postJobTitle = message;
	}

	if ( values.createDashboard && ! values.dashboardTitle.trim() ) {
		errors.dashboardTitle = message;
	}

	if ( values.createJobs && ! values.jobsTitle.trim() ) {
		errors.jobsTitle = message;
	}

	return errors;
};

const PageRenderer = ( { disabled, explanation, input, meta } ) => {
	const isError = !! ( meta.touched && meta.error );

	return (
		<div className="page-setup__page">
			<FormTextInput { ...input } disabled={ disabled } />
			{ isError && <FormInputValidation isError text={ meta.error } /> }
			{ explanation &&
				<FormSettingExplanation>
					{ explanation }
				</FormSettingExplanation>
			}
		</div>
	);
};

class PageSetup extends Component {
	static propTypes = {
		createDashboard: PropTypes.bool,
		createJobs: PropTypes.bool,
		createPages: PropTypes.func.isRequired,
		createPostJob: PropTypes.bool,
		goToNextStep: PropTypes.bool,
		handleSubmit: PropTypes.func,
		isCreating: PropTypes.bool,
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

	createSelectedPages = values => {
		const titles = [];
		const { siteId } = this.props;
		const {
			createDashboard,
			createJobs,
			createPostJob,
			dashboardTitle,
			jobsTitle,
			postJobTitle,
		} = values;

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
			handleSubmit,
			isCreating,
			slug,
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
								<Field
									component={ PageRenderer }
									disabled={ ! createPostJob || isCreating }
									explanation={ translate(
										'Creates a page that allows employers to post new jobs directly from a page on your website, ' +
										'instead of requiring them to log in to an admin area. If you\'d rather not allow this -- ' +
										'for example, if you want employers to use the admin dashboard only -- you can uncheck ' +
										'this setting.'
									) }
									name="postJobTitle" />
							</FormFieldset>

							<FormFieldset>
								<ReduxFormToggle
									disabled={ isCreating }
									name="createDashboard" />
								<Field
									component={ PageRenderer }
									disabled={ ! createDashboard || isCreating }
									explanation={ translate(
										'Creates a page that allows employers to manage their job listings directly from a page on your ' +
										'website, instead of requiring them to log in to an admin area. If you want to manage all ' +
										'job listings from the admin dashboard only, you can uncheck this setting.'
									) }
									name="dashboardTitle" />
							</FormFieldset>

							<FormFieldset>
								<ReduxFormToggle
									disabled={ isCreating }
									name="createJobs" />
								<Field
									component={ PageRenderer }
									disabled={ ! createJobs || isCreating }
									explanation={ translate( 'Creates a page where visitors can browse, search, and filter ' +
										'job listings.' ) }
									name="jobsTitle" />
							</FormFieldset>
						</form>
					</div>
				</CompactCard>

				<CompactCard>
					<a
						className="page-setup__skip"
						href={ slug && `${ SetupPath }/${ slug }/${ Steps.CONFIRMATION }` }>
						{ translate( 'Skip this step' ) }
					</a>
					<Button primary
						className="page-setup__create-pages"
						disabled={ ( ! createPostJob && ! createDashboard && ! createJobs ) || isCreating }
						onClick={ handleSubmit( this.createSelectedPages ) }>
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
		...selector( state, 'createDashboard', 'createJobs', 'createPostJob' ),
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
	},
	validate,
} );

export default compose(
	localize, // Must be the outer HOC, as the validation function relies on `translate` prop
	connect( mapStateToProps, mapDispatchToProps ),
	createReduxForm,
)( PageSetup );
