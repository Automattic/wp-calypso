/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import config from 'config';
import PressThis from './press-this';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import QueryTaxonomies from 'components/data/query-taxonomies';
import TaxonomyCard from './taxonomies/taxonomy-card';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	siteSupportsJetpackSettingsUi
} from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestPostTypes } from 'state/post-types/actions';
import Composing from './composing';
import CustomContentTypes from './custom-content-types';
import Masterbar from './masterbar';
import MediaSettings from './media-settings';
import ThemeEnhancements from './theme-enhancements';
import PublishingTools from './publishing-tools';
import QueryJetpackModules from 'components/data/query-jetpack-modules';

class SiteSettingsFormWriting extends Component {
	renderSectionHeader( title, showButton = true ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	}

	render() {
		const {
			eventTracker,
			fields,
			handleSelect,
			handleToggle,
			handleAutosavingToggle,
			handleAutosavingRadio,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			setFieldValue,
			siteId,
			translate,
			updateFields,
		} = this.props;

		return (
			<form
				id="site-settings"
				onSubmit={ this.props.handleSubmitForm }
				className="site-settings__general-settings"
			>

				{
					this.props.isJetpackSite && this.props.jetpackMasterbarSupported && (
						<div>
							{
								this.renderSectionHeader( translate( 'WordPress.com toolbar' ), false )
							}
							<Masterbar
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
							/>
						</div>
					)
				}

				{ config.isEnabled( 'manage/site-settings/categories' ) &&
					<div className="site-settings__taxonomies">
						<QueryTaxonomies siteId={ siteId } postType="post" />
						<TaxonomyCard taxonomy="category" postType="post" />
						<TaxonomyCard taxonomy="post_tag" postType="post" />
					</div>
				}

				{ this.renderSectionHeader( translate( 'Composing' ) ) }
				<Composing
					handleSelect={ handleSelect }
					handleToggle={ handleToggle }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
					eventTracker={ eventTracker }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
					updateFields={ updateFields }
				/>
				{
					this.props.isJetpackSite && this.props.jetpackSettingsUISupported && (
						<div>
							{
								this.renderSectionHeader( translate( 'Media' ) )
							}
							<MediaSettings
								siteId={ this.props.siteId }
								handleAutosavingToggle={ handleAutosavingToggle }
								onChangeField={ onChangeField }
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								fields={ fields } />
						</div>
					)
				}
				{
					this.props.isJetpackSite && this.props.jetpackSettingsUISupported && (
						<div>
							<QueryJetpackModules siteId={ this.props.siteId } />

							<CustomContentTypes
								onSubmitForm={ this.props.handleSubmitForm }
								handleAutosavingToggle={ handleAutosavingToggle }
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								fields={ fields }
							/>

							<ThemeEnhancements
								onSubmitForm={ this.props.handleSubmitForm }
								handleAutosavingToggle={ handleAutosavingToggle }
								handleAutosavingRadio={ handleAutosavingRadio }
								isSavingSettings={ isSavingSettings }
								isRequestingSettings={ isRequestingSettings }
								fields={ fields }
							/>

							{ config.isEnabled( 'press-this' ) &&
								<PublishingTools
									onSubmitForm={ this.props.handleSubmitForm }
									isSavingSettings={ isSavingSettings }
									isRequestingSettings={ isRequestingSettings }
									fields={ fields }
								/>
							}
						</div>
					)
				}

				{ config.isEnabled( 'press-this' ) && ! ( this.props.isJetpackSite || this.props.jetpackSettingsUISupported ) && (
					<div>
						{
							this.renderSectionHeader( translate( 'Press This', {
								context: 'name of browser bookmarklet tool'
							} ), false )
						}

						<PressThis />
					</div>
				) }
			</form>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			jetpackSettingsUISupported: siteSupportsJetpackSettingsUi( state, siteId ),
			jetpackMasterbarSupported: isJetpackMinimumVersion( state, siteId, '4.8' ),
			isJetpackSite: isJetpackSite( state, siteId ),
			siteId
		};
	},
	{ requestPostTypes },
	null,
	{ pure: false }
);

const getFormSettings = settings => {
	const formSettings = pick( settings, [
		'default_post_format',
		'custom-content-types',
		'jetpack_testimonial',
		'jetpack_portfolio',
		'infinite-scroll',
		'infinite_scroll',
		'minileven',
		'wp_mobile_excerpt',
		'wp_mobile_featured_images',
		'wp_mobile_app_promos',
		'post_by_email_address',
		'after-the-deadline',
		'onpublish',
		'onupdate',
		'guess_lang',
		'Bias Language',
		'Cliches',
		'Complex Expression',
		'Diacritical Marks',
		'Double Negative',
		'Hidden Verbs',
		'Jargon Language',
		'Passive voice',
		'Phrases to Avoid',
		'Redundant Expression',
		'ignored_phrases',
		'photon',
		'carousel',
		'carousel_background_color',
		'carousel_display_exif',
		'date_format',
		'start_of_week',
		'time_format',
		'timezone_string',
	] );

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = get( settings, 'gmt_offset' );
	const timezone_string = get( settings, 'timezone_string' );

	if (
		! timezone_string &&
		typeof gmt_offset === 'string' &&
		gmt_offset.length
	) {
		formSettings.timezone_string = 'UTC' +
			( /\-/.test( gmt_offset ) ? '' : '+' ) +
			gmt_offset;
	}

	return formSettings;
};

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormWriting );
