import { useTranslate } from 'i18n-calypso';
import { VisibilityCwControls } from 'calypso/reader/social/composer';
import type { MastodonVisibility } from '@automattic/api-core';

interface Props {
	visibility: MastodonVisibility;
	onVisibilityChange: ( value: MastodonVisibility ) => void;
	cwEnabled: boolean;
	onCwToggle: ( enabled: boolean ) => void;
	summary: string;
	onSummaryChange: ( value: string ) => void;
}

/**
 * Mastodon wrapper around the shared `<VisibilityCwControls>`. Same
 * shape as the Fediverse wrapper — the option labels match
 * ("Public" / "Quiet public" / "Followers only", per Mastodon web)
 * but the wire value for the followers-only option is `'private'`
 * (Mastodon API contract). `'direct'` is intentionally omitted from
 * the in-Reader composer (parity with Fediverse — CM-704).
 */
export function MastodonComposerControls( {
	visibility,
	onVisibilityChange,
	cwEnabled,
	onCwToggle,
	summary,
	onSummaryChange,
}: Props ) {
	const translate = useTranslate();
	return (
		<VisibilityCwControls< MastodonVisibility >
			className="mastodon-composer-controls"
			visibility={ visibility }
			onVisibilityChange={ onVisibilityChange }
			visibilityOptions={ [
				{ value: 'public', label: String( translate( 'Public' ) ) },
				{ value: 'unlisted', label: String( translate( 'Quiet public' ) ) },
				{ value: 'private', label: String( translate( 'Followers only' ) ) },
			] }
			cwEnabled={ cwEnabled }
			onCwToggle={ onCwToggle }
			summary={ summary }
			onSummaryChange={ onSummaryChange }
		/>
	);
}
