/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import isActivatingJetpackModule from 'state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { activateModule } from 'state/jetpack/modules/actions';
import { isJetpackSite } from 'state/sites/selectors';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SupportInfo from 'components/support-info';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

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
		const { isRequestingSettings, isSavingSettings } = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderContentTypeSettings( name, label, description ) {
		const {
			activatingCustomContentTypesModule,
			fields,
			handleAutosavingToggle,
			onChangeField,
			translate,
		} = this.props;
		const numberFieldIdentifier = name === 'post' ? 'posts_per_page' : name + '_posts_per_page';
		const isDisabled = this.isFormPending() || ( ! fields[ name ] && name !== 'post' );
		const hasToggle = name !== 'post';

		return (
			<div className="custom-content-types__module-settings">
				{ hasToggle ? (
					<CompactFormToggle
						checked={ !! fields[ name ] }
						disabled={ this.isFormPending() || activatingCustomContentTypesModule }
						onChange={ handleAutosavingToggle( name ) }
					>
						<span className="custom-content-types__label">{ label }</span>
					</CompactFormToggle>
				) : (
					<div
						id={ numberFieldIdentifier }
						className={ classnames( 'custom-content-types__label', {
							'indented-form-field': ! hasToggle,
						} ) }
					>
						{ label }
					</div>
				) }
				<div className="custom-content-types__indented-form-field indented-form-field">
					{ translate( 'Display {{field /}} per page', {
						comment:
							'The field value is a number that refers to site content type, e.g., blog post, testimonial or portfolio project',
						components: {
							field: (
								<FormTextInput
									name={ numberFieldIdentifier }
									type="number"
									step="1"
									min="0"
									aria-labelledby={ numberFieldIdentifier }
									value={
										'undefined' === typeof fields[ numberFieldIdentifier ]
											? 10
											: fields[ numberFieldIdentifier ]
									}
									onChange={ onChangeField( numberFieldIdentifier ) }
									disabled={ isDisabled }
								/>
							),
						},
					} ) }
				</div>
				<FormSettingExplanation isIndented>{ description }</FormSettingExplanation>
			</div>
		);
	}

	renderBlogPostSettings() {
		const { translate } = this.props;
		const fieldLabel = translate( 'Blog Posts' );
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
					link: <a href={ localizeUrl( 'https://wordpress.com/support/testimonials/' ) } />,
				},
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
					link: <a href={ localizeUrl( 'https://wordpress.com/support/portfolios/' ) } />,
				},
			}
		);

		return this.renderContentTypeSettings( 'jetpack_portfolio', fieldLabel, fieldDescription );
	}

	render() {
		const { translate } = this.props;
		return (
			<Card className="custom-content-types site-settings">
				<FormFieldset>{ this.renderBlogPostSettings() }</FormFieldset>

				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Adds the Testimonial custom post type, allowing you to collect, organize, ' +
								'and display testimonials on your site.'
						) }
						link="https://jetpack.com/support/custom-content-types/"
					/>
					{ this.renderTestimonialSettings() }
				</FormFieldset>

				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Adds the Portfolio custom post type, allowing you to ' +
								'manage and showcase projects on your site.'
						) }
						link="https://jetpack.com/support/custom-content-types/"
					/>
					{ this.renderPortfolioSettings() }
				</FormFieldset>
			</Card>
		);
	}
}

CustomContentTypes.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

CustomContentTypes.propTypes = {
	handleAutosavingToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			customContentTypesModuleActive: isJetpackModuleActive(
				state,
				siteId,
				'custom-content-types'
			),
			activatingCustomContentTypesModule: isActivatingJetpackModule(
				state,
				siteId,
				'custom-content-types'
			),
		};
	},
	{
		activateModule,
	}
)( localize( CustomContentTypes ) );
