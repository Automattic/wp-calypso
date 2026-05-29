import { __ } from '@wordpress/i18n';
import { DEFAULT_SOCIAL_BRAND_PACK } from './brandPacks/default-pack';
import { resolvePackFonts } from './brandPacks/loadFonts';
import { campaignBriefFromManual, generateBeaCampaign, type BeaDirection } from './services/bea';
import {
	BEA_SIZES,
	getBeaLayoutFamily,
	type BeaSizeKey,
	type BeaTheme,
} from './services/beaLayouts';
import { composeBeaHtml } from './services/renderBeaPng';
import type { AgentStudioSocialAsset } from '../types';
import type { BrandPack } from './brandPacks/types';

const SIZE_KEYS: BeaSizeKey[] = [ 'cover', 'email', 'square', 'story' ];

/**
 * Server-shaped social brief — the flat structured map the
 * `a4a/persist-social-campaign` ability writes to `_a4a_brief` meta
 * and the runs endpoint surfaces under `payload.brief`. Mirrors the
 * form fields Iris collects: a required headline plus optional stat,
 * stat context, image / logo URLs, and brand pack slug.
 */
export interface ServerSocialBrief {
	headline: string;
	stat?: string;
	stat_context?: string;
	image_urls?: string[];
	logo_url?: string | null;
	logo_light_url?: string | null;
	brand_pack_slug?: string;
}

interface ComposeSocialAssetsInput {
	brief: ServerSocialBrief;
}

interface ComposeSocialAssetsResult {
	brandPackSlug: string;
	assets: AgentStudioSocialAsset[];
}

const normalizeText = ( value: string | undefined ): string =>
	value?.replace( /\s+/g, ' ' ).trim() ?? '';

function brandPackFor( brief: ServerSocialBrief ): BrandPack {
	const logo = brief.logo_url || undefined;
	const logoLight = brief.logo_light_url || logo;
	if ( ! logo ) {
		return DEFAULT_SOCIAL_BRAND_PACK;
	}
	return {
		...DEFAULT_SOCIAL_BRAND_PACK,
		logoLightUrl: logo,
		logoLightFileName: 'brand-logo',
		logoDarkUrl: logoLight ?? logo,
		logoDarkFileName: 'brand-logo-dark',
	};
}

async function resolveFonts() {
	if ( typeof window === 'undefined' || ! ( 'FontFace' in window ) ) {
		return {};
	}

	try {
		return await resolvePackFonts( DEFAULT_SOCIAL_BRAND_PACK );
	} catch ( error ) {
		// Keep generation available even if a CDN font is blocked locally.
		// eslint-disable-next-line no-console
		console.warn( '[Bea] font resolution failed:', error );
		return {};
	}
}

function slugifyDirectionId( layoutFamilyId: string, theme: BeaTheme, variantIdx: number ): string {
	const safeFamily = layoutFamilyId.replace( /[^A-Za-z0-9_-]/g, '-' );
	return `${ safeFamily }-${ theme }-${ variantIdx }`;
}

function createAssetsForDirection( {
	direction,
	directionId,
	pack,
	images,
	fonts,
}: {
	direction: BeaDirection;
	directionId: string;
	pack: BrandPack;
	images: Array< { fileName: string; dataUrl: string } >;
	fonts: Record< string, string >;
} ): AgentStudioSocialAsset[] {
	const family = getBeaLayoutFamily( direction.layoutFamilyId );
	if ( ! family ) {
		return [];
	}

	return SIZE_KEYS.filter( ( sizeKey ) => family.sizes[ sizeKey ].blocks.length > 0 ).map(
		( sizeKey ) => {
			const { html, size } = composeBeaHtml( {
				family,
				sizeKey,
				theme: direction.theme as BeaTheme,
				slots: direction.slots,
				imageAssignments: direction.imageAssignments,
				images,
				pack,
				fontFamily: fonts.body,
				displayFontFamily: fonts.display,
			} );

			return {
				id: `${ directionId }-${ sizeKey }`,
				label: size.label,
				sizeKey,
				width: size.width,
				height: size.height,
				html,
				groupLabel: direction.variantLabel,
				directionId,
			};
		}
	);
}

/**
 * Convert the server-shaped social brief into Iris's rendered tiles.
 *
 * The wpcom recipe (`compose-social-campaign-v1`) persists the flat
 * form fields and the Calypso client projects them into a rich
 * CampaignBrief (via `campaignBriefFromManual`) before handing them
 * to the deterministic family picker / slot filler. HTML composition
 * stays on the client because the text-fitting math (canvas
 * measureText, binary-search font sizing) is browser-only.
 */
export async function composeSocialAssetsFromBrief(
	input: ComposeSocialAssetsInput
): Promise< ComposeSocialAssetsResult > {
	const brief = input.brief;
	const pack = brandPackFor( brief );
	const imageUrls = ( brief.image_urls ?? [] ).filter(
		( url ): url is string => typeof url === 'string' && url.length > 0
	);
	const images = imageUrls.map( ( url, idx ) => ( {
		fileName: `image-${ idx + 1 }`,
		// `dataUrl` is misnamed for this path — the renderer treats it as
		// a generic image src, so passing a portfolio-blog https URL
		// works the same as a data URL.
		dataUrl: url,
	} ) );
	const fonts = await resolveFonts();
	const result = generateBeaCampaign( {
		brief: campaignBriefFromManual( {
			title: normalizeText( brief.headline ) || __( 'Campaign graphics' ),
			stat: normalizeText( brief.stat ) || undefined,
			statContext: normalizeText( brief.stat_context ) || undefined,
			cta: __( 'Learn more' ),
		} ),
		pack,
		imageCount: images.length,
	} );

	const assets = result.directions.flatMap( ( direction, idx ) =>
		createAssetsForDirection( {
			direction,
			directionId: slugifyDirectionId( direction.layoutFamilyId, direction.theme, idx ),
			pack,
			images,
			fonts,
		} )
	);

	return {
		brandPackSlug: brief.brand_pack_slug || pack.slug,
		assets: assets.length
			? assets
			: SIZE_KEYS.map( ( sizeKey ) => ( {
					id: `fallback-${ sizeKey }`,
					label: BEA_SIZES[ sizeKey ].label,
					sizeKey,
					width: BEA_SIZES[ sizeKey ].width,
					height: BEA_SIZES[ sizeKey ].height,
					html: '',
					directionId: `fallback-${ sizeKey }`,
			  } ) ),
	};
}
