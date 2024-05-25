import { FormTokenField } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import useUpdateSiteTagsMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-tags-mutation';

interface Props {
	siteId: number;
	tags: string[];
}

export default function AgencySiteTags( { siteId, tags }: Props ) {
	const tagsMutation = useUpdateSiteTagsMutation();

	const onChange = ( newTags: string[] ) => {
		tagsMutation.mutate( { siteId, tags: newTags } );
	};

	return (
		<FormTokenField
			label={ translate( 'Add new tag' ) }
			value={ tags }
			onChange={ ( items ) => onChange( items as string[] ) }
		/>
	);
}
