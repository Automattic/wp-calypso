/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
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
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';

const ThemeEnhancements = ( {
	onSubmitForm,
	fetchingSettings,
	submittingForm,
	selectedSiteId,
	infiniteScrollModuleActive,
	minilevenModuleActive,
	translate
} ) => {
	return (
		<div>
			<QueryJetpackModules siteId={ selectedSiteId } />
			<SectionHeader label={ translate( 'Theme Enhancements' ) }>
				<Button
					compact
					primary
					onClick={ onSubmitForm }
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
										disabled={ submittingForm }
										name="infinite_scroll" />
									<span>{ translate( 'Scroll infinitely (Shows 7 posts on each load)' ) }</span>
								</FormLabel>

								<FormLabel>
									<FormCheckbox
										disabled={ submittingForm }
										name="infinite_scroll_google_analytics" />
									<span>{ translate( 'Track each infinite Scroll post load as a page view in Google Analytics' ) }</span>
								</FormLabel>
							</div>
						)
					}
				</FormFieldset>

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
						moduleSlug="minileven"
						label={ translate( 'Optimize your site with a phone-friendly theme.' ) }
						/>

					{
						minilevenModuleActive && (
							<div className="theme-enhancements__module-settings is-indented">
								<FormLabel>
									<FormCheckbox
										disabled={ submittingForm }
										name="wp_mobile_excerpt" />
									<span>{ translate( 'Use excerpts instead of full posts on front page and archive pages' ) }</span>
								</FormLabel>

								<FormLabel>
									<FormCheckbox
										disabled={ submittingForm }
										name="wp_mobile_featured_images" />
									<span>{ translate( 'Hide all featured images' ) }</span>
								</FormLabel>

								<FormLabel>
									<FormCheckbox
										disabled={ submittingForm }
										name="wp_mobile_app_promos" />
									<span>{ translate( 'Show an ad for the WordPress mobile apps in the footer' ) }</span>
								</FormLabel>
							</div>
						)
					}
				</FormFieldset>
			</Card>
		</div>
	);
};

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
	}
)( localize( ThemeEnhancements ) );
