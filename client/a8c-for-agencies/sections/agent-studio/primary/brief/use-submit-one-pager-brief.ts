import pageRouter from '@automattic/calypso-router';
import { useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import { uploadAgentMedia } from '../../data/use-upload-agent-media';
import { getAgentStudioPath } from '../../lib/paths';
import type { AgentStudioAgent } from '../../lib/agents';
import type { AgentStudioOutput, DualLogoOrder } from '../../types';

export interface SubmitOnePagerBriefInput {
	title: string;
	description: string;
	brief: string;
	blurb: string;
	logoFile: File | null;
	partnerLogoFile: File | null;
	partnerLogoOrder?: DualLogoOrder;
	imageFiles: File[];
}

// Uploads media in parallel, then fires the create-output mutation.
// The first body image is reused as `hero_url` so the cover composer
// has something to render. The agency's default project is resolved
// server-side when `project_id` is omitted.
export default function useSubmitOnePagerBrief( agent: AgentStudioAgent ) {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const createOutput = useCreateAgentStudioOutput();

	return useMutation< AgentStudioOutput, Error, SubmitOnePagerBriefInput >( {
		mutationFn: async ( input ) => {
			if ( ! agencyId ) {
				throw new Error( 'useSubmitOnePagerBrief: missing agencyId' );
			}

			const uploadOne = async ( file: File | null ): Promise< string | undefined > =>
				file ? ( await uploadAgentMedia( agencyId, file ) ).url : undefined;

			const [ logoUrl, partnerLogoUrl, ...imageUrlOrUndef ] = await Promise.all( [
				uploadOne( input.logoFile ),
				uploadOne( input.partnerLogoFile ),
				...input.imageFiles.map( ( file ) => uploadOne( file ) ),
			] );

			const imageUrls = imageUrlOrUndef.filter( ( url ): url is string => typeof url === 'string' );
			const heroUrl = imageUrls[ 0 ];

			return createOutput.mutateAsync( {
				agentId: agent.id,
				agentName: agent.name,
				deliverableType: agent.deliverableType,
				title: input.title,
				description: input.description,
				brief: input.brief,
				blurb: input.blurb,
				imageUrls,
				logoUrl,
				partnerLogoUrl,
				partnerLogoOrder: partnerLogoUrl ? input.partnerLogoOrder : undefined,
				heroUrl,
			} );
		},
		onSuccess: ( output ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_output_created', {
					agent_id: agent.id,
					output_id: output.id,
				} )
			);
			dispatch(
				successNotice(
					sprintf(
						/* translators: %s is an agent name. */
						__( '%s is on it. Your deliverable is generating.' ),
						output.agentName
					),
					{ duration: 5000 }
				)
			);
			pageRouter( getAgentStudioPath() );
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not start the deliverable. Please try again.' ) ) );
		},
	} );
}
