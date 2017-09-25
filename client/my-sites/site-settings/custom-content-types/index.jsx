/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import InfoPopover from 'components/info-popover';
import { activateModule } from 'state/jetpack/modules/actions';
import { isJetpackModuleActive, isActivatingJetpackModule } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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

	renderPostsPerPageField( fieldName, postTypeLabel ) {
		const {
			fields,
			onChangeField,
			translate,
		} = this.props;
		const numberFieldName = fieldName === 'post'
			? 'posts_per_page'
			: fieldName + '_posts_per_page';
		const isDisabled = this.isFormPending() || ( ! fields[ fieldName ] && fieldName !== 'post' );

		return (
			<div className="custom-content-types__indented-form-field indented-form-field">
				{ translate(
					'Display {{field /}} %s per page',
					{
						args: postTypeLabel.toLowerCase(),
						components: {
							field: (
								<FormTextInput
									name={ numberFieldName }
									type="number"
									step="1"
									min="0"
									id={ numberFieldName }
									value={ 'undefined' === typeof fields[ numberFieldName ] ? 10 : fields[ numberFieldName ] }
									onChange={ onChangeField( numberFieldName ) }
									disabled={ isDisabled }
								/>
							)
						}
					}
				) }
			</div>
		);
	}

	renderContentTypeSettings( name, label, description ) {
		const {
			activatingCustomContentTypesModule,
			fields,
			handleAutosavingToggle
		} = this.props;
		return (
			<div className="custom-content-types__module-settings">
				{
					name !== 'post'
						? (
							<CompactFormToggle
								checked={ !! fields[ name ] }
								disabled={ this.isFormPending() || activatingCustomContentTypesModule }
								onChange={ handleAutosavingToggle( name ) }
							>
								{ label }
							</CompactFormToggle>
						)
						: (
							<div className="custom-content-types__label">
								{ label }
							</div>
						)
				}

				{ this.renderPostsPerPageField( name, label ) }

				<FormSettingExplanation isIndented>
					{ description }
				</FormSettingExplanation>
			</div>
		);
	}

	renderBlogPostSettings() {
		const { translate } = this.props;
		const fieldLabel = translate( 'Blog posts' );
		const fieldDescription = translate( 'On blog pages, the number of posts to show per page.' );

		return (
			<div className="custom-content-types__module-settings">
				{ this.renderContentTypeSettings( 'post', fieldLabel, fieldDescription ) }
			</div>
		);
	}

	renderTestimonialSettings() {
		const { translate } = this.props;
		const fieldLabel = translate( 'Testimonials' );
		const fieldDescription = translate(
			'Add, organize, and display {{link}}testimonials{{/link}}. If your theme doesn’t support testimonials yet, ' +
			'you can display them using the shortcode [testimonials].',
			{
				components: {
					link: <a href="https://support.wordpress.com/testimonials/" />
				}
			}
		);

		return this.renderContentTypeSettings( 'jetpack_testimonial', fieldLabel, fieldDescription );
	}

	renderPortfolioSettings() {
		const { translate } = this.props;
		const fieldLabel = translate( 'Portfolio Projects' );
		const fieldDescription = translate(
			'Add, organize, and display {{link}}portfolio projects{{/link}}. If your theme doesn’t support portfolio projects yet, ' +
			'you can display them using the shortcode [portfolio].',
			{
				components: {
					link: <a href="https://support.wordpress.com/portfolios/" />
				}
			}
		);

		return this.renderContentTypeSettings( 'jetpack_portfolio', fieldLabel, fieldDescription );
	}

	render() {
		const { translate } = this.props;
		return (
			<Card className="custom-content-types site-settings">
				<FormFieldset>
					<div className="custom-content-types__info-link-container site-settings__info-link-container">
						<InfoPopover position="left">
							<ExternalLink href="https://support.wordpress.com/custom-post-types/" icon target="_blank">
								{ translate( 'Learn more about Custom Content Types.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>

					{ this.renderBlogPostSettings() }
					{ this.renderTestimonialSettings() }
					{ this.renderPortfolioSettings() }
				</FormFieldset>
			</Card>
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
	onChangeField: PropTypes.func.isRequired,
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
			customContentTypesModuleActive: isJetpackModuleActive( state, siteId, 'custom-content-types' ),
			activatingCustomContentTypesModule: isActivatingJetpackModule( state, siteId, 'custom-content-types' ),
		};
	},
	{
		activateModule
	}
)( localize( CustomContentTypes ) );
