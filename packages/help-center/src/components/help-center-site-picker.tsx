import { SitePickerDropDown, SitePickerSite } from '@automattic/site-picker';
import { TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { HELP_CENTER_STORE } from '../stores';
import { SitePicker } from '../types';
import { HelpCenterOwnershipNotice } from './help-center-notice';
import type { HelpCenterSelect } from '@automattic/data-stores';

export const HelpCenterSitePicker: React.FC< SitePicker > = ( {
	ownershipResult,
	sitePickerChoice,
	setSitePickerChoice,
	currentSite,
	siteId,
	sitePickerEnabled,
} ) => {
	const { setSite, setUserDeclaredSiteUrl } = useDispatch( HELP_CENTER_STORE );
	const userDeclaredSiteUrl = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.getUserDeclaredSiteUrl();
	}, [] );

	const otherSite = {
		name: __( 'Other site', __i18n_text_domain__ ),
		ID: 0,
		logo: { id: '', sizes: [] as never[], url: '' },
		URL: '',
	} as const;

	const options: ( SitePickerSite | undefined )[] = [ currentSite, otherSite ];

	return (
		<>
			{ sitePickerEnabled && (
				<section>
					<SitePickerDropDown
						enabled
						onPickSite={ ( id: string | number ) => {
							if ( id !== 0 ) {
								setSite( currentSite );
							}
							setSitePickerChoice( id === 0 ? 'OTHER_SITE' : 'CURRENT_SITE' );
						} }
						options={ options }
						siteId={ siteId }
					/>
				</section>
			) }

			{ sitePickerChoice === 'OTHER_SITE' && (
				<section>
					<TextControl
						label={ __( 'Site address', __i18n_text_domain__ ) }
						value={ userDeclaredSiteUrl ?? '' }
						onChange={ setUserDeclaredSiteUrl }
					/>
					<HelpCenterOwnershipNotice ownershipResult={ ownershipResult } />
				</section>
			) }
		</>
	);
};
