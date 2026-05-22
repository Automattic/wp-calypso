import { DEFAULT_SOCIAL_BRAND_PACK } from './brandPacks/default-pack';
import { resolvePackFonts } from './brandPacks/loadFonts';
import { generateBeaCampaign, type ManualCampaignFields } from './services/bea';
import {
	BEA_SIZES,
	getBeaLayoutFamily,
	type BeaSizeKey,
	type BeaTheme,
} from './services/beaLayouts';
import { composeBeaHtml } from './services/renderBeaPng';
import type {
	AgentStudioSocialAsset,
	AgentStudioSocialAssets,
	AgentStudioSocialImage,
	CreateAgentStudioOutputInput,
} from '../types';
import type { BrandPack } from './brandPacks/types';

const SIZE_KEYS: BeaSizeKey[] = [ 'cover', 'email', 'square', 'story' ];

const normalizeText = ( value: string | undefined ): string =>
	value?.replace( /\s+/g, ' ' ).trim() ?? '';

const manualFieldsFromInput = ( input: CreateAgentStudioOutputInput ): ManualCampaignFields => ( {
	title: normalizeText( input.headline ) || normalizeText( input.title ) || 'Campaign graphics',
	stat: normalizeText( input.stat ) || undefined,
	statContext:
		normalizeText( input.statContext ) || normalizeText( input.description ) || undefined,
	cta: 'Learn more',
} );

async function resolveFonts() {
	if ( typeof window === 'undefined' || ! ( 'FontFace' in window ) ) {
		return {};
	}

	try {
		return await resolvePackFonts( DEFAULT_SOCIAL_BRAND_PACK );
	} catch ( error ) {
		// The prototype falls back to system stacks when font registration fails.
		// Keep generation available even if a CDN font is blocked locally.
		// eslint-disable-next-line no-console
		console.warn( '[Bea] font resolution failed:', error );
		return {};
	}
}

function getBrandPackForInput( input: CreateAgentStudioOutputInput ): BrandPack {
	if ( ! input.socialLogo?.dataUrl ) {
		return DEFAULT_SOCIAL_BRAND_PACK;
	}

	return {
		...DEFAULT_SOCIAL_BRAND_PACK,
		logoLightUrl: input.socialLogo.dataUrl,
		logoLightFileName: input.socialLogo.fileName,
		logoDarkUrl: input.socialLogoLight?.dataUrl ?? input.socialLogo.dataUrl,
		logoDarkFileName: input.socialLogoLight?.fileName ?? input.socialLogo.fileName,
	};
}

function createAssetsForDirection( {
	direction,
	pack,
	images,
	fonts,
}: {
	direction: Awaited< ReturnType< typeof generateBeaCampaign > >[ 'directions' ][ number ];
	pack: BrandPack;
	images: AgentStudioSocialImage[];
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
				id: `${ direction.layoutFamilyId }-${ direction.theme }-${ sizeKey }`,
				label: size.label,
				sizeKey,
				width: size.width,
				height: size.height,
				html,
				groupLabel: direction.variantLabel,
			};
		}
	);
}

export async function createSocialAssets(
	input: CreateAgentStudioOutputInput
): Promise< AgentStudioSocialAssets > {
	// PROTOTYPE-SWAP: images and logos arrive here as inline data URLs
	// (`{ fileName, dataUrl }`) so the prototype can rasterize tiles entirely
	// in the browser. In production these should be uploaded once via
	// `POST /a4a/media`, stored as URLs on the project, and re-fetched here —
	// also tagged PROTOTYPE-SWAP in `social-assets-brief-form.tsx`.
	const images = input.socialImages ?? [];
	const pack = getBrandPackForInput( input );
	const sourceText = normalizeText( input.sourceText );
	const fonts = await resolveFonts();
	const result = await generateBeaCampaign( {
		sourceText: sourceText || undefined,
		manualFields: sourceText ? undefined : manualFieldsFromInput( input ),
		pack,
		imageCount: images.length,
		campaignGoal: 'drive-read',
	} );

	const assets = result.directions.flatMap( ( direction ) =>
		createAssetsForDirection( { direction, pack, images, fonts } )
	);

	return {
		brandPackSlug: pack.slug,
		images,
		logo: input.socialLogo,
		logoOnDark: input.socialLogoLight,
		assets: assets.length
			? assets
			: SIZE_KEYS.map( ( sizeKey ) => ( {
					id: `fallback-${ sizeKey }`,
					label: BEA_SIZES[ sizeKey ].label,
					sizeKey,
					width: BEA_SIZES[ sizeKey ].width,
					height: BEA_SIZES[ sizeKey ].height,
					html: '',
			  } ) ),
	};
}
