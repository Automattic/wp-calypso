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
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/selectors';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

class ThemeEnhancements extends Component {
	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	renderToggle( name, label ) {
		const { fields, handleToggle } = this.props;
		return (
			<FormToggle
				className="theme-enhancements__module-settings-toggle is-compact"
				checked={ !! fields[ name ] }
				disabled={ this.isFormPending() }
				onChange={ handleToggle( name ) }>
				<span className="site-settings__toggle-label">
					{ label }
				</span>
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
			<SectionHeader label={ translate( 'Theme Enhancements' ) }>
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

	renderInfiniteScrollSettings() {
		const {
			selectedSiteId,
			infiniteScrollModuleActive,
			translate
		} = this.props;
		const formPending = this.isFormPending();

		return (
			<FormFieldset>
				<div className="theme-enhancements__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/infinite-scroll' } target="_blank">
							{ translate( 'Learn more about Infinite Scroll' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="infinite-scroll"
					label={ translate( 'Add support for infinite scroll to your theme.' ) }
					disabled={ formPending }
					/>

				{
					infiniteScrollModuleActive && (
						<div className="theme-enhancements__module-settings is-indented">
							{
								this.renderToggle( 'infinite_scroll', translate(
									'Scroll infinitely (Shows 7 posts on each load)'
								) )
							}
							{
								this.renderToggle( 'infinite_scroll_google_analytics', translate(
									'Track each infinite Scroll post load as a page view in Google Analytics'
								) )
							}
						</div>
					)
				}
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
				<div className="theme-enhancements__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href={ 'https://jetpack.com/support/mobile-theme' } target="_blank">
							{ translate( 'Learn more about Mobile Theme' ) }
						</ExternalLink>
					</InfoPopover>
				</div>

				<JetpackModuleToggle
					siteId={ selectedSiteId }
					moduleSlug="minileven"
					label={ translate( 'Optimize your site with a mobile-friendly theme for tablets and phones.' ) }
					disabled={ formPending }
					/>

				{
					minilevenModuleActive && (
						<div className="theme-enhancements__module-settings is-indented">
							{
								this.renderToggle( 'wp_mobile_excerpt', translate(
									'Show excerpts on front page and on archive pages instead of full posts'
								) )
							}
							{
								this.renderToggle( 'wp_mobile_featured_images', translate(
									'Hide all featured images'
								) )
							}
							{
								this.renderToggle( 'wp_mobile_app_promos', translate(
									'Show an ad for the WordPress mobile apps in the footer of the mobile theme'
								) )
							}
						</div>
					)
				}
			</FormFieldset>
		);
	}

	render() {
		return (
			<div>
				{ this.renderHeader() }

				<Card className="theme-enhancements__card site-settings">
					{ this.renderInfiniteScrollSettings() }
					{ this.renderMinilevenSettings() }
				</Card>
			</div>
		);
	}
}

ThemeEnhancements.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

ThemeEnhancements.propTypes = {
	onSubmitForm: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

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
