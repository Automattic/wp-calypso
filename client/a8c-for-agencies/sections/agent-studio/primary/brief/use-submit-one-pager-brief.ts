import pageRouter from '@automattic/calypso-router';
import { useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useCreateAgentStudioOutput from '../../data/use-create-agent-studio-output';
import useResolveDefaultProject from '../../data/use-resolve-default-project';
import useUploadAgentMedia from '../../data/use-upload-agent-media';
import { getAgentStudioPath } from '../../lib/paths';
import type { AgentStudioAgent } from '../../lib/agents';
import type { AgentStudioOutput, DualLogoOrder } from '../../types';

export interface SubmitOnePagerBriefInput {
	title: string;
	description: string;
	/** Raw source text for the layout director. */
	brief: string;
	/** Short subheading rendered on the cover. */
	blurb: string;
	/** Optional primary logo (rendered on the cover footer). */
	logoFile: File | null;
	/** Optional partner / co-marketing logo. */
	partnerLogoFile: File | null;
	/** Which logo sits on the leading edge of the dual-logo separator. */
	partnerLogoOrder?: DualLogoOrder;
	/** Body images the layout director can place via `{{IMAGE_N_URL}}`. */
	imageFiles: File[];
}

/**
 * Orchestrates the one-pager brief submission:
 *
 *   1. Resolve the agency's default project id (find-or-create — see
 *      `useResolveDefaultProject`). Cached after the first run in the
 *      session so subsequent submissions don't re-resolve.
 *   2. Upload every selected file to `POST /a4a/media` in parallel
 *      (logo, partner logo, body images). Each returns a public URL.
 *   3. Fire `useCreateAgentStudioOutput` with the URLs threaded into
 *      the recipe input (`logo_url`, `partner_logo_url`,
 *      `image_urls`, `hero_url`, `project_id`).
 *   4. The first body image is also passed as `hero_url` so the cover
 *      composer has something to render. Users who don't want the
 *      cover image repeated in the body can reorder / remove inside
 *      the brief form.
 *
 * Returns a mutation-like surface (`mutate`, `isPending`) so the brief
 * form can drive the generating overlay off `isPending`.
 */
export default function useSubmitOnePagerBrief( agent: AgentStudioAgent ) {
	const dispatch = useDispatch();
	const uploadMedia = useUploadAgentMedia();
	const resolveDefaultProject = useResolveDefaultProject();
	const createOutput = useCreateAgentStudioOutput();

	return useMutation< AgentStudioOutput, Error, SubmitOnePagerBriefInput >( {
		mutationFn: async ( input ) => {
			const projectId = String( await resolveDefaultProject.mutateAsync() );

			const uploadOne = async ( file: File | null ): Promise< string | undefined > => {
				if ( ! file ) {
					return undefined;
				}
				const result = await uploadMedia.mutateAsync( file );
				return result.url;
			};

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
				projectId,
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
