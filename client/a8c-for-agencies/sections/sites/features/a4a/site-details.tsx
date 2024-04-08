import { translate } from 'i18n-calypso';
import { useState } from 'react';
import AgencySiteTags from 'calypso/a8c-for-agencies/components/agency-site-tags';
import useUpdateSiteTagsMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-tags-mutation';
import SiteTagType from 'calypso/a8c-for-agencies/types/site-tag';
import './style.scss';

export default function SiteDetails( { site }: any ) {
	/* eslint-disable-next-line */
	const { a4a_site_id: siteId, a4a_site_tags: initialTags } = site;

	const [ tags, setTags ] = useState(
		initialTags ? initialTags.map( ( tag: SiteTagType ) => tag.label ) : []
	);

	const { mutate } = useUpdateSiteTagsMutation();

	const onAddTags = ( siteTags: string[] ) => {
		const newTags = tags.concat( siteTags );
		setTags( newTags );
		mutate(
			{
				siteId,
				tags: newTags,
			},
			{
				/* eslint-disable-next-line */
				onSuccess: console.log,
				/* eslint-disable-next-line */
				onError: console.error,
			}
		);
	};

	const onRemoveTag = ( toRemove: string ) => {
		const newTags = tags.filter( ( tag: string ) => tag !== toRemove );
		setTags( newTags );
		/* eslint-disable-next-line */
		console.log( newTags );
	};

	return (
		<div className="site-details">
			<h3 className="site-details__section-header">{ translate( 'Tags' ) }</h3>
			<AgencySiteTags
				{ ...{
					tags,
					onAddTags,
					onRemoveTag,
				} }
			/>
		</div>
	);
}
