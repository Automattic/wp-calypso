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
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive, isActivatingJetpackModule } from 'state/selectors';
import { activateModule } from 'state/jetpack/modules/actions';

class CustomContentTypes extends Component {
	componentDidUpdate() {
		const {
			activatingCustomContentTypesModule,
			customContentTypesModuleActive,
			fields,
			siteId
		} = this.props;

		if ( customContentTypesModuleActive !== false ) {
			return;
		}

		if ( ! fields.jetpack_portfolio && ! fields.jetpack_testimonial ) {
			return;
		}

		if ( activatingCustomContentTypesModule ) {
			return;
		}

		this.props.activateModule( siteId, 'custom-content-types', true );
	}

	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, label ) {
		const {
			activatingCustomContentTypesModule,
			fields,
			handleAutosavingToggle
		} = this.props;
		return (
			<FormToggle
				className="custom-content-types__module-settings-toggle is-compact"
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || activatingCustomContentTypesModule }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</FormToggle>
		);
	}

	renderHeader() {
		const {
			translate
		} = this.props;

		return (
			<SectionHeader label={ translate( 'Custom Content Types' ) } />
		);
	}

	renderContentTypeSettings( fieldName, fieldLabel, fieldDescription ) {
		return (
			<div className="custom-content-types__module-settings">
				{ this.renderToggle( fieldName, fieldLabel ) }
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
	handleAutosavingToggle: PropTypes.func.isRequired,
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
			customContentTypesModuleActive: isJetpackModuleActive( state, siteId, 'custom-content-types' ),
			activatingCustomContentTypesModule: isActivatingJetpackModule( state, siteId, 'custom-content-types' ),
		};
	},
	{
		activateModule
	}
)( localize( CustomContentTypes ) );
