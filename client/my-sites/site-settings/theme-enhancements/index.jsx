/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormCheckbox from 'components/forms/form-checkbox';
import JetpackModuleToggle from '../jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isModuleActive } from 'state/jetpack-settings/modules/selectors';
import { updateModuleSettings } from 'state/jetpack-settings/module-settings/actions';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class ThemeEnhancements extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			infinite_scroll: 1,
			infinite_scroll_google_analytics: 0,
			wp_mobile_excerpt: 'disabled',
			wp_mobile_featured_images: 'disabled',
			wp_mobile_app_promos: 0
		};

		this.onCheckboxChange = this.onCheckboxChange.bind( this );
		this.onSubmitForm = this.onSubmitForm.bind( this );
	}

	sanitizeFieldValue( fieldName, fieldValue ) {
		switch ( fieldName ) {
			case 'wp_mobile_excerpt':
			case 'wp_mobile_featured_images':
				return fieldValue ? 'enabled' : 'disabled';
		}

		return fieldValue;
	}

	onCheckboxChange( event ) {
		const currentTargetName = event.currentTarget.name,
			currentTargetChecked = !! event.currentTarget.checked;

		this.setState( {
			[ currentTargetName ]: this.sanitizeFieldValue( currentTargetName, currentTargetChecked )
		} );
	}

	updateSettingsForModule( module ) {
		const { selectedSiteId } = this.props;
		let fields = [];

		switch ( module ) {
			case 'infinite-scroll':
				fields = [ 'infinite_scroll', 'infinite_scroll_google_analytics' ];
				break;
			case 'minileven':
				fields = [ 'wp_mobile_excerpt', 'wp_mobile_featured_images', 'wp_mobile_app_promos' ];
				break;
		}

		if ( ! fields.length ) {
			return;
		}

		return this.props.updateModuleSettings( selectedSiteId, module, pick( this.state, fields ) );
	}

	onSubmitForm() {
		// TODO: real handling of the form
		this.updateSettingsForModule( 'infinite-scroll' );
		this.updateSettingsForModule( 'minileven' );
	}

	render() {
		const {
			fetchingSettings,
			submittingForm,
			selectedSiteId,
			infiniteScrollModuleActive,
			minilevenModuleActive,
			translate
		} = this.props;
		return (
			<div>
				<QueryJetpackModules siteId={ selectedSiteId } />
				<SectionHeader label={ translate( 'Theme Enhancements' ) }>
					<Button
						compact
						primary
						onClick={ this.onSubmitForm }
						disabled={ fetchingSettings || submittingForm }>
						{ submittingForm ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<Card className="theme-enhancements__card site-settings">
					<FormFieldset>
						<div className="theme-enhancements__info-link-container">
							<InfoPopover position={ 'left' }>
								<ExternalLink icon={ true } href={ 'https://jetpack.com/support/infinite-scroll' } target="_blank">
									{ translate( 'Learn more about Infinite Scroll' ) }
								</ExternalLink>
							</InfoPopover>
						</div>

						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="infinite-scroll"
							label={ translate( 'Add support for infinite scroll to your theme.' ) }
							/>

						{
							infiniteScrollModuleActive && (
								<div className="theme-enhancements__module-settings is-indented">
									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ submittingForm }
											name="infinite_scroll" />
										<span>{ translate( 'Scroll infinitely (Shows 7 posts on each load)' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ submittingForm }
											name="infinite_scroll_google_analytics" />
										<span>
											{ translate(
												'Track each infinite Scroll post load as a page view in Google Analytics'
											) }
										</span>
									</FormLabel>
								</div>
							)
						}
					</FormFieldset>

					<FormFieldset>
						<div className="theme-enhancements__info-link-container">
							<InfoPopover position={ 'left' }>
								<ExternalLink icon={ true } href={ 'https://jetpack.com/support/mobile-theme' } target="_blank">
									{ translate( 'Learn more about Mobile Theme' ) }
								</ExternalLink>
							</InfoPopover>
						</div>

						<JetpackModuleToggle
							siteId={ selectedSiteId }
							moduleSlug="minileven"
							label={ translate( 'Optimize your site with a phone-friendly theme.' ) }
							/>

						{
							minilevenModuleActive && (
								<div className="theme-enhancements__module-settings is-indented">
									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ submittingForm }
											name="wp_mobile_excerpt" />
										<span>{ translate( 'Use excerpts instead of full posts on front page and archive pages' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ submittingForm }
											name="wp_mobile_featured_images" />
										<span>{ translate( 'Hide all featured images' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ submittingForm }
											name="wp_mobile_app_promos" />
										<span>
											{ translate(
												'Show an ad for the WordPress mobile apps in the footer of the mobile theme'
											) }
										</span>
									</FormLabel>
								</div>
							)
						}
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

ThemeEnhancements.defaultProps = {
	submittingForm: false,
};

ThemeEnhancements.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	fetchingSettings: PropTypes.bool.isRequired,
	submittingForm: PropTypes.bool,
};

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			infiniteScrollModuleActive: !! isModuleActive( state, selectedSiteId, 'infinite-scroll' ),
			minilevenModuleActive: !! isModuleActive( state, selectedSiteId, 'minileven' ),
		};
	},
	{
		updateModuleSettings
	}
)( protectForm( localize( ThemeEnhancements ) ) );
