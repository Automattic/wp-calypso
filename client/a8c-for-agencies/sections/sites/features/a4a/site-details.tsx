import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import AgencySiteNotes from 'calypso/a8c-for-agencies/components/agency-site-notes';
import AgencySiteTags from 'calypso/a8c-for-agencies/components/agency-site-tags';
import { SiteTag } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import './style.scss';

export default function SiteDetails( { site }: any ) {
	const translate = useTranslate();
	const { a4a_site_id: siteId, a4a_site_notes: notes, a4a_site_tags: tags } = site;

	return (
		<div className="site-details">
			<div className="site-details__section">
				<CompactCard className="site-details__section-header">
					<h3>{ translate( 'Tags' ) }</h3>
				</CompactCard>
				<CompactCard>
					<AgencySiteTags siteId={ siteId } tags={ tags.map( ( tag: SiteTag ) => tag.label ) } />
				</CompactCard>
			</div>
			<div className="site-details__section">
				<CompactCard className="site-details__section-header">
					<h3>{ translate( 'Notes' ) }</h3>
				</CompactCard>
				<CompactCard>
					<AgencySiteNotes key={ siteId } siteId={ siteId } notes={ notes } />
				</CompactCard>
			</div>
		</div>
	);
}
