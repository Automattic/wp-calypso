/**
 * ReviewerChip — avatar + name when `reviewers_metadata` gives a Gravatar,
 * otherwise a coloured full-name pill (hue deterministic from name, so the
 * same reviewer reads the same colour across cards).
 */

export interface ReviewerMetadata {
	display_name?: string;
	avatar_url?: string | null;
	bio?: string;
}

interface ReviewerChipProps {
	/** The display name exactly as it appears in the mediation payload. */
	name: string;
	/** Server-provided metadata keyed by name; may be missing for some reviewers. */
	metadata?: ReviewerMetadata | null;
	/** Optional tooltip content. Default: the bio (if present) or display name. */
	title?: string;
	/** Visual variant. Inline is the default (used in running text / lists). */
	variant?: 'inline' | 'compact';
}

/**
 * Deterministic 32-bit FNV-1a-ish hash → integer. Two identical strings hash
 * to the same number, so the same reviewer name yields the same hue everywhere.
 * Not cryptographic — deterministic colouring only.
 * @param text Input string.
 * @returns Non-negative integer.
 */
function hashName( text: string ): number {
	let hash = 2166136261;
	for ( let i = 0; i < text.length; i++ ) {
		hash ^= text.charCodeAt( i );
		hash = ( hash * 16777619 ) >>> 0;
	}
	return hash >>> 0;
}

/**
 * Generate a HSL-based background + border for a coloured pill. Translucent
 * so the underlying chat surface (dark or light) shows through — the name
 * text can then inherit the ambient colour without contrast hacks.
 * @param name Reviewer name (drives the hue).
 */
function getPillColours( name: string ): { background: string; border: string } {
	const hue = hashName( name ) % 360;
	return {
		background: `hsla(${ hue }, 55%, 55%, 0.2)`,
		border: `hsla(${ hue }, 60%, 55%, 0.45)`,
	};
}

/**
 * Component.
 * @param           props            ReviewerChipProps.
 * @param {string}  props.name       Display name to show.
 * @param           props.metadata   Server-provided metadata; avatar_url + bio when known.
 * @param {string}  props.title      Optional tooltip text.
 * @param           props.variant    Visual variant — 'inline' (default) or 'compact' for dense lists.
 * @returns React element.
 */
/** Avatar URLs are server-built from WordPress avatar APIs; keep only a scheme guard here. */
function isSafeAvatarUrl( url: string | null | undefined ): url is string {
	return typeof url === 'string' && /^https:\/\//i.test( url );
}

export default function ReviewerChip( {
	name,
	metadata,
	title,
	variant = 'inline',
}: ReviewerChipProps ) {
	const tooltip = title ?? metadata?.bio ?? name;
	const avatarUrl = isSafeAvatarUrl( metadata?.avatar_url ) ? metadata.avatar_url : null;

	if ( avatarUrl ) {
		return (
			<span className={ `jetpack-ai-reviewer-chip is-avatar is-${ variant }` } title={ tooltip }>
				<img
					className="jetpack-ai-reviewer-chip__avatar"
					src={ avatarUrl }
					alt=""
					width={ 20 }
					height={ 20 }
					loading="lazy"
				/>
				<span className="jetpack-ai-reviewer-chip__name">{ name }</span>
			</span>
		);
	}

	const { background, border } = getPillColours( name );
	return (
		<span
			className={ `jetpack-ai-reviewer-chip is-pill is-${ variant }` }
			style={ { background, borderColor: border } }
			title={ tooltip }
		>
			{ name }
		</span>
	);
}
