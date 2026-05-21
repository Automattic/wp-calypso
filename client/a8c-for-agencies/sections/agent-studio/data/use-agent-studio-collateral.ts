/**
 * `GET /a4a/collateral/<post_id>` — variants, brand, coverage report,
 * picked frame/theme. The flat outputs endpoint doesn't include any
 * of this.
 */
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface AgentStudioCollateralVariant {
	frame: string;
	theme: string;
	variant_id: string;
	page_count: number;
	html_url: string;
	pdf_download_url: string;
}

export interface AgentStudioCollateralResponse {
	post_id: number;
	title: string;
	kind: string;
	format: string;
	page_count: number;
	frame_layout: string;
	theme_variant: string;
	selected_variant_id: string | null;
	brand: Record< string, unknown > | null;
	coverage_report: Record< string, unknown > | null;
	variants: AgentStudioCollateralVariant[];
	body_html: string;
	project_id: number | null;
}

export const getAgentStudioCollateralQueryKey = (
	agencyId: number | undefined,
	postId: number | undefined
) => [ 'a4a-agent-studio-collateral', agencyId, postId ];

export default function useAgentStudioCollateral( postId: number | undefined ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AgentStudioCollateralResponse >( {
		queryKey: getAgentStudioCollateralQueryKey( agencyId, postId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/a4a/collateral/${ postId }`,
			} ),
		enabled: !! agencyId && !! postId,
		refetchOnWindowFocus: false,
	} );
}
