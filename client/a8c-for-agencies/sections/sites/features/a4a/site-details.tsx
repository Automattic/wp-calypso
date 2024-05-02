import { CompactCard } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import AgencySiteNotes from 'calypso/a8c-for-agencies/components/agency-site-notes';
import AgencySiteTags from 'calypso/a8c-for-agencies/components/agency-site-tags';
import useCreateSiteNoteMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-create-site-note-mutation';
import useUpdateSiteTagsMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-update-site-tags-mutation';
import SiteTagType from 'calypso/a8c-for-agencies/types/site-tag';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import './style.scss';

export default function SiteDetails( { site }: any ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	/* eslint-disable-next-line */
	const { a4a_site_id: siteId, a4a_site_notes: initialNotes, a4a_site_tags: initialTags } = site;

	const [ tags, setTags ] = useState(
		initialTags ? initialTags.map( ( tag: SiteTagType ) => tag.label ) : []
	);

	const [ notes, setNotes ] = useState( initialNotes ?? [] );

	const [ isLoading, setIsLoading ] = useState( false );
	const { mutate: mutateTags } = useUpdateSiteTagsMutation();
	const { mutate: mutateNotes } = useCreateSiteNoteMutation();
	const queryClient = useQueryClient();

	const onCreateNote = ( note: string ) => {
		setIsLoading( true );
		mutateNotes(
			{
				siteId,
				note,
			},
			{
				onSuccess: ( data ) => {
					setNotes( [ data ].concat( notes ) );
					setIsLoading( false );
					queryClient.invalidateQueries( {
						queryKey: [ 'jetpack-agency-dashboard-sites' ],
					} );
				},
				onError: ( error ) => {
					setIsLoading( false );
					dispatch( errorNotice( error.message ) );
				},
			}
		);
	};

	const onSetTags = ( siteTags: string[] ) => {
		setIsLoading( true );
		mutateTags(
			{
				siteId,
				tags: siteTags,
			},
			{
				onSuccess: ( data ) => {
					setTags( data.map( ( tag: SiteTagType ) => tag.label ) );
					setIsLoading( false );
					queryClient.invalidateQueries( {
						queryKey: [ 'jetpack-agency-dashboard-sites' ],
					} );
				},
				onError: ( error ) => {
					setIsLoading( false );
					dispatch( errorNotice( error.message ) );
				},
			}
		);
	};

	return (
		<div className="site-details">
			<div className="site-details__section">
				<CompactCard className="site-details__section-header">
					<h3>{ translate( 'Tags' ) }</h3>
				</CompactCard>
				<CompactCard>
					<AgencySiteTags
						{ ...{
							tags,
							onSetTags,
							isLoading,
						} }
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
							isLoading,
						} }
					/>
				</CompactCard>
			</div>
		</div>
	);
}
