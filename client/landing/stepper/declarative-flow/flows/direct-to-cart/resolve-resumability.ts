import { clearResumeRecord, readResumeRecord, resumeKey } from './resume-storage';

export interface SitePlanStatusResult {
	status: 'active' | 'pending' | 'none';
}

export type ResolveResumabilityResult =
	| { kind: 'create' }
	| { kind: 'create'; apiError: true }
	| { kind: 'purchased'; siteSlug: string }
	| { kind: 'unpurchased'; siteSlug: string };

interface ResolveResumabilityArgs {
	integration: string | null;
	contextId: string | null;
	plan: string;
	fetchSitePlanStatus: ( siteSlug: string, plan: string ) => Promise< SitePlanStatusResult >;
}

export async function resolveResumability(
	args: ResolveResumabilityArgs
): Promise< ResolveResumabilityResult > {
	const key = resumeKey( args.integration, args.contextId );
	const record = readResumeRecord( key );

	if ( ! record || record.plan !== args.plan ) {
		return { kind: 'create' };
	}

	try {
		const { status } = await args.fetchSitePlanStatus( record.siteSlug, args.plan );
		if ( status === 'active' ) {
			return { kind: 'purchased', siteSlug: record.siteSlug };
		}
		return { kind: 'unpurchased', siteSlug: record.siteSlug };
	} catch {
		clearResumeRecord( key );
		return { kind: 'create', apiError: true };
	}
}
