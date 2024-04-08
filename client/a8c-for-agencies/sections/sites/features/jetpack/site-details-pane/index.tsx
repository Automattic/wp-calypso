import { useState } from 'react';
import AgencySiteTags from 'calypso/a8c-for-agencies/components/agency-site-tags';
import SiteTagType from 'calypso/a8c-for-agencies/types/site-tag';
import './style.scss';

interface Props {
	site: any;
}

export function SiteDetailsPane( { site }: Props ) {
	const { a4a_agency_id: agencyId, a4a_site_id: siteId, a4a_site_tags: initialTags } = site;

	const [ tags, setTags ] = useState( initialTags.map( ( tag: SiteTagType ) => tag.label ) );

	const onAddTags = ( newTags: string[] ) => {
		const newTagList = tags.concat( newTags );
		setTags( newTagList );
		/* eslint-disable-next-line */
		console.log( agencyId, siteId, newTagList );
	};

	const onRemoveTag = ( removeTag: string ) => {
		const newTagList = tags.filter( ( tag: string ) => tag !== removeTag );
		setTags( newTagList );
		/* eslint-disable-next-line */
		console.log( agencyId, siteId, newTagList );
	};

	return (
		<div className="site-details-pane">
			<AgencySiteTags { ...{ agencyId, siteId, tags, onAddTags, onRemoveTag } } />
		</div>
	);
}
