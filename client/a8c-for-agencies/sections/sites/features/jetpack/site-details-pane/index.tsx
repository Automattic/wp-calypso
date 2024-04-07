import { useState } from 'react';
import { Gravatar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import SiteTag from './site-tag';
import SiteTagField from './site-tag-field';
import './style.scss';

interface Props {
	site: any;
}

interface Tag {
	id: number;
	slug: string;
	label: string;
}

export function SiteDetailsPane( { site }: Props ) {
	const { a4a_agency_id: agencyId, a4a_site_id: siteId, a4a_site_tags } = site;

	const translate = useTranslate();
	const user = useSelector( getCurrentUser );
	const [ tags, setTags ] = useState( a4a_site_tags );

	const onRemoveTag = ( tagId: number ) => {
		console.log( `DELETE /agency/${ agencyId }/sites/${ siteId }/tags/${ tagId }` );
		const newTags = tags.filter( ( tag: Tag ) => tag.id !== tagId );
		setTags( newTags );
	};

	const onSaveNewTag = ( tagLabel: string ) => {
		console.log( `POST /agency/${ agencyId }/sites/${ siteId }/tags?label=${ tagLabel }` );
		setTags( tags.concat( [ { id: 0, label: tagLabel, slug: '' } ] ) );
	};

	const tagComponents = tags?.map( ( tag: Tag ) => (
		<SiteTag key={ tag.id } id={ tag.id } label={ tag.label } onRemoveTag={ onRemoveTag } />
	) );

	return (
		<div className="site-details-pane">
			<div className="site-details-pane__tag-section">
				<h3 className="site-details-pane__section-heading">{ translate( 'Tags' ) }</h3>
				<div className="site-details-pane__section-description">
					{ translate( 'Add tags to easily search and filter through sites.' ) }
				</div>
				<div className="site-details-pane__tag-list">
					{ tagComponents }
					<SiteTagField onSaveNewTag={ onSaveNewTag } />
				</div>
			</div>
			<div className="site-details-pane__notes-section">
				<h3 className="site-details-pane__section-heading">{ translate( 'Notes' ) }</h3>
				<div className="site-details-pane__section-description">
					{ translate( "Add notes to mention any special circumstances for your clients' sites." ) }
				</div>
				<div className="site-details-pane__add-note">
					<Gravatar
						className="site-details-pane__note-user-icon"
						user={ user }
						size={ 32 }
						alt={ translate( 'Notes user', { textOnly: true } ) }
					/>
					<a className="site-details-pane__add-tag-link">{ translate( 'Add a note' ) }</a>
				</div>
			</div>
		</div>
	);
}
