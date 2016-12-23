/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pick, map } from 'lodash';

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
import QueryJetpackModuleSettings from 'components/data/query-jetpack-module-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isModuleActive, isFetchingModules } from 'state/jetpack-settings/modules/selectors';
import { getCurrentModuleSettings, isRequestingModuleSettings } from 'state/jetpack-settings/module-settings/selectors';
import { updateModuleSettings } from 'state/jetpack-settings/module-settings/actions';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class ThemeEnhancements extends Component {
	constructor( props ) {
		super( props );

		this.state = {};

		this.onCheckboxChange = this.onCheckboxChange.bind( this );
		this.onSubmitForm = this.onSubmitForm.bind( this );
	}

	componentWillReceiveProps( nextProps ) {
		const moduleSettings = {
			...nextProps.infiniteScrollModuleSettings,
			...nextProps.minilevenModuleSettings
		};

		map( moduleSettings, ( settingValue, settingName ) => {
			if ( ! this.state.hasOwnProperty( settingName ) ) {
				this.setState( { [ settingName ]: settingValue } );
			}
		} );
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

	onSubmitForm( event ) {
		const { onSubmitForm } = this.props;

		this.updateSettingsForModule( 'infinite-scroll' );
		this.updateSettingsForModule( 'minileven' );

		onSubmitForm( event );
	}

	render() {
		const {
			fetchingSettings,
			fetchingModuleData,
			submittingForm,
			selectedSiteId,
			infiniteScrollModuleActive,
			minilevenModuleActive,
			translate
		} = this.props;
		const isFormPending = fetchingSettings || fetchingModuleData || submittingForm;

		return (
			<div>
				<QueryJetpackModules siteId={ selectedSiteId } />
				<QueryJetpackModuleSettings siteId={ selectedSiteId } moduleSlug={ 'infinite-scroll' } />
				<QueryJetpackModuleSettings siteId={ selectedSiteId } moduleSlug={ 'minileven' } />

				<SectionHeader label={ translate( 'Theme Enhancements' ) }>
					<Button
						compact
						primary
						onClick={ this.onSubmitForm }
						disabled={ isFormPending }>
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
											disabled={ isFormPending }
											checked={ !! this.state.infinite_scroll }
											name="infinite_scroll" />
										<span>{ translate( 'Scroll infinitely (Shows 7 posts on each load)' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ isFormPending }
											checked={ !! this.state.infinite_scroll_google_analytics }
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
									{ translate( 'Learn more about the Mobile Theme' ) }
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
											disabled={ isFormPending }
											checked={ this.state.wp_mobile_excerpt === 'enabled' }
											name="wp_mobile_excerpt" />
										<span>{ translate( 'Use excerpts instead of full posts on front page and archive pages' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ isFormPending }
											checked={ this.state.wp_mobile_featured_images === 'enabled' }
											name="wp_mobile_featured_images" />
										<span>{ translate( 'Hide all featured images' ) }</span>
									</FormLabel>

									<FormLabel>
										<FormCheckbox
											onChange={ this.onCheckboxChange }
											disabled={ isFormPending }
											checked={ !! this.state.wp_mobile_app_promos }
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
		const fetchingModules = isFetchingModules( state, selectedSiteId );
		const fetchingInfiniteScrollModuleSettings = isRequestingModuleSettings( state, selectedSiteId, 'infinite-scroll' );
		const fetchingMinilevenModuleSettings = isRequestingModuleSettings( state, selectedSiteId, 'minileven' );

		return {
			selectedSiteId,
			infiniteScrollModuleActive: !! isModuleActive( state, selectedSiteId, 'infinite-scroll' ),
			minilevenModuleActive: !! isModuleActive( state, selectedSiteId, 'minileven' ),
			infiniteScrollModuleSettings: getCurrentModuleSettings( state, selectedSiteId, 'infinite-scroll' ),
			minilevenModuleSettings: getCurrentModuleSettings( state, selectedSiteId, 'minileven' ),
			fetchingModuleData: !! ( fetchingModules || fetchingInfiniteScrollModuleSettings || fetchingMinilevenModuleSettings )
		};
	},
	{
		updateModuleSettings
	}
)( protectForm( localize( ThemeEnhancements ) ) );
