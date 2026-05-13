import { useTranslate } from 'i18n-calypso';
import { VisibilityCwControls } from 'calypso/reader/social/composer';
import type { FediverseVisibility } from '@automattic/api-core';

interface Props {
	visibility: FediverseVisibility;
	onVisibilityChange: ( value: FediverseVisibility ) => void;
	cwEnabled: boolean;
	onCwToggle: ( enabled: boolean ) => void;
	summary: string;
	onSummaryChange: ( value: string ) => void;
}

/**
 * Fediverse wrapper around the shared `<VisibilityCwControls>` —
 * supplies the Fediverse visibility enum and the wp-admin-aligned
 * option labels ("Public" / "Quiet public" / "Followers only" — see
 * `wordpress-activitypub/integration/class-classic-editor.php`).
 *
 * The wire value `'followers'` is Fediverse-specific (Mastodon's
 * equivalent is `'private'`). The visible label "Followers only"
 * matches both surfaces. AP `sensitive` (media-blur) was removed
 * with slice 2 because there's no media yet; re-introduce alongside
 * the media slot in a follow-up slice.
 */
export function FediverseComposerControls( {
	visibility,
	onVisibilityChange,
	cwEnabled,
	onCwToggle,
	summary,
	onSummaryChange,
}: Props ) {
	const translate = useTranslate();
	return (
		<VisibilityCwControls< FediverseVisibility >
			className="fediverse-composer-controls"
			visibility={ visibility }
			onVisibilityChange={ onVisibilityChange }
			visibilityOptions={ [
				{ value: 'public', label: String( translate( 'Public' ) ) },
				{ value: 'unlisted', label: String( translate( 'Quiet public' ) ) },
				{ value: 'followers', label: String( translate( 'Followers only' ) ) },
			] }
			cwEnabled={ cwEnabled }
			onCwToggle={ onCwToggle }
			summary={ summary }
			onSummaryChange={ onSummaryChange }
		/>
	);
}
