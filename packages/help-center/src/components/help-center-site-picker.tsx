import { TextControl, SelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useSiteSlug } from '../hooks/use-site-slug';
import { HELP_CENTER_STORE } from '../stores';
import { SitePicker } from '../types';
import { HelpCenterOwnershipNotice } from './help-center-notice';
import type { HelpCenterSelect } from '@automattic/data-stores';

export const HelpCenterSitePicker: React.FC< SitePicker > = ( {
	ownershipResult,
	isSelfDeclaredSite,
	onSelfDeclaredSite,
} ) => {
	const { setUserDeclaredSiteUrl } = useDispatch( HELP_CENTER_STORE );
	const userDeclaredSiteUrl = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.getUserDeclaredSiteUrl();
	}, [] );

	// The lack of site slug implies the user has no sites at all.
	const siteSlug = useSiteSlug();

	return (
		<>
			{ siteSlug && (
				<section>
					<SelectControl
						label="Site"
						options={ [
							{ label: siteSlug, value: 'current' },
							{ label: __( 'Another site' ), value: 'another_site' },
						] }
						onChange={ ( value ) => {
							onSelfDeclaredSite( value === 'another_site' );
						} }
					></SelectControl>
				</section>
			) }
			{ isSelfDeclaredSite && (
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
