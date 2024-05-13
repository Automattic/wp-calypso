import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AgencySiteNotes from 'calypso/a8c-for-agencies/components/agency-site-notes';
import AgencySiteTags from 'calypso/a8c-for-agencies/components/agency-site-tags';
import useCreateSiteNoteMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-create-site-note-mutation';
import useUpdateSiteTagsMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-tags-mutation';
import './style.scss';
import SiteTag from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export default function SiteDetails( { site }: any ) {
	const translate = useTranslate();
	const { a4a_site_id: siteId, a4a_site_notes: notes, a4a_site_tags: tags } = site;

	const tagsMutation = useUpdateSiteTagsMutation();
	const notesMutation = useCreateSiteNoteMutation();

	const onChangeTags = ( newTags: string[] ) => {
		tagsMutation.mutate( { siteId, tags: newTags } );
	};

	const onCreateNote = ( note: string ) => {
		notesMutation.mutate( { siteId, note } );
	};

	return (
		<div className="site-details">
			<div className="site-details__section">
				<CompactCard className="site-details__section-header">
					<h3>{ translate( 'Tags' ) }</h3>
				</CompactCard>
				<CompactCard>
					<AgencySiteTags
						tags={ tags.map( ( tag: SiteTag ) => tag.label ) }
						onChange={ onChangeTags }
					/>
				</CompactCard>
			</div>
			<div className="site-details__section">
				<CompactCard className="site-details__section-header">
					<h3>{ translate( 'Notes' ) }</h3>
				</CompactCard>
				<CompactCard>
					<AgencySiteNotes
						{ ...{
							notes,
							onCreateNote,
						} }
					/>
				</CompactCard>
			</div>
		</div>
	);
}
