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
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class ThemeEnhancements extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {}
	};

	static propTypes = {
		onSubmitForm: PropTypes.func.isRequired,
		handleAutosavingToggle: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, isDisabled, label ) {
		const { fields, handleAutosavingToggle } = this.props;
		return (
			<CompactFormToggle
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() || isDisabled }
				onChange={ handleAutosavingToggle( name ) }
			>
				{ label }
			</CompactFormToggle>
		);
	}

	renderInfiniteScrollSettings() {
		const {
			selectedSiteId,
			infiniteScrollModuleActive,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/infinite-scroll' } icon target="_blank">
							{ translate( 'Learn more about Infinite Scroll.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="infinite-scroll"
					label={ translate( 'Add support for infinite scroll to your theme' ) }
					disabled={ formPending }
					/>

				<div className="theme-enhancements__module-settings site-settings__child-settings">
					{
						this.renderToggle( 'infinite_scroll', ! infiniteScrollModuleActive, translate(
							'Scroll infinitely (Shows 7 posts on each load)'
						) )
					}
					{
						this.renderToggle( 'infinite_scroll_google_analytics', ! infiniteScrollModuleActive, translate(
							'Track each infinite Scroll post load as a page view in Google Analytics'
						) )
					}
				</div>
			</FormFieldset>
		);
	}

	renderMinilevenSettings() {
		const {
			selectedSiteId,
			minilevenModuleActive,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="theme-enhancements__info-link-container site-settings__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/mobile-theme' } icon target="_blank">
							{ translate( 'Learn more about Mobile Theme.' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="minileven"
					label={ translate( 'Optimize your site with a mobile-friendly theme for tablets and phones' ) }
					disabled={ formPending }
					/>

				<div className="theme-enhancements__module-settings site-settings__child-settings">
					{
						this.renderToggle( 'wp_mobile_excerpt', ! minilevenModuleActive, translate(
							'Show excerpts on front page and on archive pages instead of full posts'
						) )
					}
					{
						this.renderToggle( 'wp_mobile_featured_images', ! minilevenModuleActive, translate(
							'Hide all featured images'
						) )
					}
					{
						this.renderToggle( 'wp_mobile_app_promos', ! minilevenModuleActive, translate(
							'Show an ad for the {{link}}WordPress mobile apps{{/link}} in the footer of the mobile theme',
							{
								components: {
									link: <a href="https://apps.wordpress.com/" />
								}
							}
						) )
					}
				</div>
			</FormFieldset>
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Theme Enhancements' ) } />

				<Card className="theme-enhancements__card site-settings">
					{ this.renderInfiniteScrollSettings() }

					<hr />

					{ this.renderMinilevenSettings() }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			infiniteScrollModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'infinite-scroll' ),
			minilevenModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'minileven' ),
		};
	}
)( localize( ThemeEnhancements ) );
