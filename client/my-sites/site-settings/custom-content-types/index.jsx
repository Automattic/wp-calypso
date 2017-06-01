/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive, isActivatingJetpackModule } from 'state/selectors';
import { isPostTypeSupported } from 'state/post-types/selectors';
import { activateModule } from 'state/jetpack/modules/actions';
import { isJetpackSite } from 'state/sites/selectors';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import QueryPostTypes from 'components/data/query-post-types';

class CustomContentTypes extends Component {
	componentDidUpdate() {
		const {
			activatingCustomContentTypesModule,
			customContentTypesModuleActive,
			fields,
			siteId,
			siteIsJetpack,
		} = this.props;

		if ( ! siteIsJetpack ) {
			return;
		}

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

	renderDescription( description ) {
		return (
			<FormSettingExplanation isIndented>
				{ description }
			</FormSettingExplanation>
		);
	}

	renderToggle( name, label, description ) {
		const {
			activatingCustomContentTypesModule,
			fields,
			handleAutosavingToggle
		} = this.props;
		return (
			<div>
				<CompactFormToggle
					checked={ !! fields[ name ] }
					disabled={ this.isFormPending() || activatingCustomContentTypesModule }
					onChange={ handleAutosavingToggle( name ) }
				>
					{ label }
				</CompactFormToggle>
				{ this.renderDescription( description ) }
			</div>
		);
	}

	renderSupportedContentType( fieldName, fieldLabel, fieldDescription ) {
		return (
			<div className="custom-content-types__module-settings">
				<div className="custom-content-types__form-toggle-placeholder form-toggle__placeholder">
					<Gridicon icon="checkmark" />
					{ fieldLabel }
				</div>

				{ this.renderDescription( fieldDescription ) }
			</div>
		);
	}

	renderContentTypeSettings( fieldName, fieldLabel, fieldDescription ) {
		return (
			<div className="custom-content-types__module-settings">
				{ this.renderToggle( fieldName, fieldLabel, fieldDescription ) }
			</div>
		);
	}

	renderTestimonialSettings() {
		const {
			isTestimonialSupported,
			translate
		} = this.props;
		const fieldLabel = translate( 'Testimonials' );
		const fieldDescription = translate(
			'Add, organize, and display {{link}}testimonials{{/link}}. If your theme doesn’t support testimonials yet, ' +
			'you can display them using the shortcode ( [testimonials] ).',
			{
				components: {
					link: <a href="https://support.wordpress.com/testimonials/" />
				}
			}
		);

		if ( isTestimonialSupported ) {
			return this.renderSupportedContentType( 'jetpack_testimonial', fieldLabel, fieldDescription );
		}

		return this.renderContentTypeSettings( 'jetpack_testimonial', fieldLabel, fieldDescription );
	}

	renderPortfolioSettings() {
		const {
			isPortfolioSupported,
			translate
		} = this.props;
		const fieldLabel = translate( 'Portfolios' );
		const fieldDescription = translate(
			'Add, organize, and display {{link}}portfolios{{/link}}. If your theme doesn’t support portfolios yet, ' +
			'you can display them using the shortcode ( [portfolios] ).',
			{
				components: {
					link: <a href="https://support.wordpress.com/portfolios/" />
				}
			}
		);

		if ( isPortfolioSupported ) {
			return this.renderSupportedContentType( 'jetpack_portfolio', fieldLabel, fieldDescription );
		}

		return this.renderContentTypeSettings( 'jetpack_portfolio', fieldLabel, fieldDescription );
	}

	render() {
		const {
			siteId,
			translate
		} = this.props;

		return (
			<div>
				{ siteId && <QueryPostTypes siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Custom content types' ) } />

				<Card className="custom-content-types__card site-settings">
					<FormFieldset>
						<div className="custom-content-types__info-link-container site-settings__info-link-container">
							<InfoPopover position="left">
								<ExternalLink href="https://support.wordpress.com/custom-post-types/" icon target="_blank">
									{ translate( 'Learn more about Custom Content Types.' ) }
								</ExternalLink>
							</InfoPopover>
						</div>

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
	handleAutosavingToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			isPortfolioSupported: isPostTypeSupported( state, siteId, 'jetpack-portfolio' ),
			isTestimonialSupported: isPostTypeSupported( state, siteId, 'jetpack-testimonial' ),
			customContentTypesModuleActive: isJetpackModuleActive( state, siteId, 'custom-content-types' ),
			activatingCustomContentTypesModule: isActivatingJetpackModule( state, siteId, 'custom-content-types' ),
		};
	},
	{
		activateModule
	}
)( localize( CustomContentTypes ) );
