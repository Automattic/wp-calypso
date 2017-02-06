/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class CustomContentTypes extends Component {
	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleToggle } = this.props;
		return (
			<FormToggle
				className="custom-content-types__module-settings-toggle is-compact"
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleToggle( name ) }
			>
				{ label }
			</FormToggle>
		);
	}

	renderHeader() {
		const {
			onSubmitForm,
			isSavingSettings,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<SectionHeader label={ translate( 'Custom Content Types' ) }>
				<Button
					compact
					primary
					onClick={ onSubmitForm }
					disabled={ formPending }
				>
					{ isSavingSettings
						? translate( 'Saving…' )
						: translate( 'Save Settings' )
					}
				</Button>
			</SectionHeader>
		);
	}

	renderModuleToggle() {
		const {
			siteId,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<div>
				<div className="custom-content-types__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/custom-content-types' } target="_blank">
							{ translate( 'Learn more about Custom Content Types' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="custom-content-types"
					label={ translate( 'Display different types of content on your site with custom content types.' ) }
					disabled={ formPending }
					/>
			</div>
		);
	}

	renderContentTypeSettings( fieldName, fieldLabel, fieldDescription ) {
		const { customContentTypesModuleActive } = this.props;

		return (
			<div className="custom-content-types__module-settings is-indented">
				{ this.renderToggle( fieldName, ! customContentTypesModuleActive, fieldLabel ) }
				<p className="form-setting-explanation">
					{ fieldDescription }
				</p>
			</div>
		);
	}

	renderTestimonialSettings() {
		const {
			site,
			translate
		} = this.props;
		const fieldLabel = translate(
			'Enable {{strong}}Testimonial{{/strong}} custom content types.',
			{
				components: {
					strong: <strong />,
				}
			}
		);
		const fieldDescription = translate(
			'The Testimonial custom content type allows you to add, organize, and display your ' +
			'testimonials. If your theme doesn’t support it yet, you can display testimonials using ' +
			'the {{shortcodeLink}}testimonial shortcode{{/shortcodeLink}} ( [testimonials] ) ' +
			'or you can {{archiveLink}}view a full archive of your testimonials{{/archiveLink}}.',
			{
				components: {
					shortcodeLink: <a href="https://support.wordpress.com/testimonials-shortcode/" />,
					archiveLink: <a href={ site.URL.replace( /\/$/, '' ) + '/testimonial' } />
				}
			}
		);

		return this.renderContentTypeSettings( 'jetpack_testimonial', fieldLabel, fieldDescription );
	}

	renderPortfolioSettings() {
		const {
			site,
			translate
		} = this.props;
		const fieldLabel = translate(
			'Enable {{strong}}Portfolio{{/strong}} custom content types.',
			{
				components: {
					strong: <strong />,
				}
			}
		);
		const fieldDescription = translate(
			'The Portfolio custom content type gives you an easy way to manage and showcase projects ' +
			'on your site. If your theme doesn’t support it yet, you can display the portfolio using ' +
			'the {{shortcodeLink}}portfolio shortcode{{/shortcodeLink}} ( [portfolio] ) ' +
			'or you can {{archiveLink}}view a full archive of your portfolio projects{{/archiveLink}}.',
			{
				components: {
					shortcodeLink: <a href="https://support.wordpress.com/portfolios/portfolio-shortcode/" />,
					archiveLink: <a href={ site.URL.replace( /\/$/, '' ) + '/portfolio' } />
				}
			}
		);

		return this.renderContentTypeSettings( 'jetpack_portfolio', fieldLabel, fieldDescription );
	}

	render() {
		return (
			<div>
				{ this.renderHeader() }

				<Card className="custom-content-types__card site-settings">
					<FormFieldset>
						{ this.renderModuleToggle() }
						{ this.renderTestimonialSettings() }
						{ this.renderPortfolioSettings() }
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

CustomContentTypes.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

CustomContentTypes.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );

		return {
			siteId,
			site,
			customContentTypesModuleActive: !! isJetpackModuleActive( state, siteId, 'custom-content-types' ),
		};
	}
)( localize( CustomContentTypes ) );
