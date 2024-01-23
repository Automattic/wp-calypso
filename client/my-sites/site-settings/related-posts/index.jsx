import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite as isJetpackSiteSelector } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RelatedContentPreview from './related-content-preview';

import './style.scss';

export const RelatedPostsSetting = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || 0;
	const isJetpack = useSelector( ( state ) => isJetpackSiteSelector( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );

	return (
		<FormFieldset>
			<SupportInfo
				text={ translate(
					'The feature helps visitors find more of your content by displaying related posts at the bottom of each post.'
				) }
				link={
					isJetpack && ! isAtomic
						? 'https://jetpack.com/support/related-posts/'
						: localizeUrl(
								'https://wordpress.com/support/related-posts/#related-posts-classic-themes'
						  )
				}
				privacyLink={
					isJetpack && ! isAtomic ? true : localizeUrl( 'https://automattic.com/privacy/' )
				}
			/>

			<ToggleControl
				checked={ !! fields.jetpack_relatedposts_enabled }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( 'jetpack_relatedposts_enabled' ) }
				label={ translate( 'Show related content after posts' ) }
			/>

			<div className="related-posts__module-settings site-settings__child-settings">
				<ToggleControl
					checked={ !! fields.jetpack_relatedposts_show_headline }
					disabled={
						isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
					}
					onChange={ handleToggle( 'jetpack_relatedposts_show_headline' ) }
					label={ translate( 'Highlight related content with a heading' ) }
				/>
				<ToggleControl
					checked={ !! fields.jetpack_relatedposts_show_thumbnails }
					disabled={
						isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
					}
					onChange={ handleToggle( 'jetpack_relatedposts_show_thumbnails' ) }
					label={ translate( 'Show a thumbnail image where available' ) }
				/>
				<ToggleControl
					checked={ !! fields.jetpack_relatedposts_show_date }
					disabled={
						isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
					}
					onChange={ handleToggle( 'jetpack_relatedposts_show_date' ) }
					label={ translate( 'Show post publish date' ) }
				/>
				<ToggleControl
					checked={ !! fields.jetpack_relatedposts_show_context }
					disabled={
						isRequestingSettings || isSavingSettings || ! fields.jetpack_relatedposts_enabled
					}
					onChange={ handleToggle( 'jetpack_relatedposts_show_context' ) }
					label={ translate( 'Show post category or tags' ) }
				/>
			</div>

			<FormSettingExplanation>
				{ translate(
					"These settings won't apply to {{a}}related posts added using the block editor{{/a}}.",
					{
						components: {
							a: (
								<a
									href={
										isJetpack && ! isAtomic
											? 'https://jetpack.com/support/jetpack-blocks/related-posts-block/'
											: localizeUrl(
													'https://wordpress.com/support/related-posts/#add-a-related-posts-block'
											  )
									}
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
			<RelatedContentPreview
				showContext={ fields.jetpack_relatedposts_show_context }
				showDate={ fields.jetpack_relatedposts_show_date }
				showHeadline={ fields.jetpack_relatedposts_show_headline }
				showThumbnails={ fields.jetpack_relatedposts_show_thumbnails }
				dateFormat={ fields.date_format }
				timezoneString={ fields.timezone_string }
			/>
		</FormFieldset>
	);
};

const RelatedPostsSection = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
} ) => {
	const translate = useTranslate();
	return (
		<div>
			<SettingsSectionHeader title={ translate( 'Related posts' ) } />

			<Card className="related-posts__card site-settings__traffic-settings">
				<RelatedPostsSetting
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					translate={ translate }
				/>
			</Card>
		</div>
	);
};

RelatedPostsSection.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

RelatedPostsSection.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default RelatedPostsSection;
