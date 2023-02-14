import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { RelatedPostsSetting as RelatedPostsFormFieldset } from 'calypso/my-sites/site-settings/related-posts';

type RelatedPostsFields = {
	jetpack_relatedposts_enabled?: boolean;
	jetpack_relatedposts_show_context?: boolean;
	jetpack_relatedposts_show_date?: boolean;
	jetpack_relatedposts_show_headline?: boolean;
	jetpack_relatedposts_show_thumbnails?: boolean;
};

type RelatedPostsSettingProps = {
	fields: RelatedPostsFields;
	handleToggle?: ( field: string ) => ( ( isChecked: boolean ) => void ) | undefined;
	isRequestingSettings?: boolean;
	isSavingSettings?: boolean;
	isJetpackSelfHosted?: boolean | null;
};

export const RelatedPostsSetting = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	isJetpackSelfHosted,
}: RelatedPostsSettingProps ) => {
	const translate = useTranslate();
	return (
		<>
			<FormLabel id="related-posts-settings" className="increase-margin-bottom-fix">
				{ translate( 'Related Posts' ) }
			</FormLabel>
			<RelatedPostsFormFieldset
				fields={ fields }
				handleToggle={ handleToggle }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
				isJetpackSelfHosted={ isJetpackSelfHosted }
			/>
		</>
	);
};
