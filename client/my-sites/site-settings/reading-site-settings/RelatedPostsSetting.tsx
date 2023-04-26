import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';
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
};

export const RelatedPostsSetting = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
}: RelatedPostsSettingProps ) => {
	const translate = useTranslate();
	return (
		<>
			<FormLabel>{ translate( 'Related Posts' ) }</FormLabel>
			<RelatedPostsFormFieldset
				fields={ fields }
				handleToggle={ handleToggle }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
			/>
		</>
	);
};
