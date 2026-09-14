import pageRouter from '@automattic/calypso-router';
import { useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import { uploadAgentMedia } from '../../data/use-upload-agent-media';
import { getAgentStudioOutputPath } from '../../lib/paths';
import type { AgentStudioAgent } from '../../lib/agents';
import type { AgentStudioOutput } from '../../types';

export interface SubmitSocialBriefInput {
	title: string;
	description: string;
	headline: string;
	stat: string;
	statContext: string;
	logoFile: File | null;
	lightLogoFile: File | null;
	imageFiles: File[];
}

// Uploads media in parallel, then fires the create-output mutation
// against the `compose-social-campaign-v1` recipe. Mirrors
// `useSubmitOnePagerBrief`: pick all files, click Submit, parallel
// uploads, then a single create-output call with the resolved URLs.
export default function useSubmitSocialBrief( agent: AgentStudioAgent ) {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );
	const createOutput = useCreateAgentStudioOutput();

	return useMutation< AgentStudioOutput, Error, SubmitSocialBriefInput >( {
		mutationFn: async ( input ) => {
			if ( ! agencyId ) {
				throw new Error( 'useSubmitSocialBrief: missing agencyId' );
			}

			const uploadOne = async ( file: File | null ): Promise< string | undefined > =>
				file ? ( await uploadAgentMedia( agencyId, file ) ).url : undefined;

			const [ logoUrl, lightLogoUrl, ...imageUrlOrUndef ] = await Promise.all( [
				uploadOne( input.logoFile ),
				uploadOne( input.lightLogoFile ),
				...input.imageFiles.map( ( file ) => uploadOne( file ) ),
			] );

			const socialImageUrls = imageUrlOrUndef.filter(
				( url ): url is string => typeof url === 'string'
			);

			return createOutput.mutateAsync( {
				agentId: agent.id,
				agentName: agent.name,
				deliverableType: agent.deliverableType,
				title: input.title,
				description: input.description,
				headline: input.headline,
				stat: input.stat,
				statContext: input.statContext,
				socialImageUrls,
				socialLogoUrl: logoUrl,
				socialLogoLightUrl: lightLogoUrl,
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
			pageRouter( getAgentStudioOutputPath( output.id ) );
		},
		onError: () => {
			dispatch( errorNotice( __( 'Could not start the deliverable. Please try again.' ) ) );
		},
	} );
}
