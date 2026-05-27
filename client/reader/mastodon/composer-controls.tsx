import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { VisibilityCwControls } from 'calypso/reader/social/composer';
import type { MastodonVisibility } from '@automattic/api-core';

interface Props {
	visibility: MastodonVisibility;
	onVisibilityChange: ( value: MastodonVisibility ) => void;
	cwEnabled: boolean;
	onCwToggle: ( enabled: boolean ) => void;
	summary: string;
	onSummaryChange: ( value: string ) => void;
	onSave: () => void;
	headingId?: string;
}

/**
 * Mastodon wrapper around the shared `<VisibilityCwControls>`. Same
 * shape as the Fediverse wrapper — the option labels match
 * ("Public" / "Quiet public" / "Followers only", per Mastodon web)
 * but the wire value for the followers-only option is `'private'`
 * (Mastodon API contract). `'direct'` is intentionally omitted from
 * the in-Reader composer (parity with Fediverse — CM-704).
 *
 * Hosted inside the composer's footer-pill popover via
 * `useMastodonComposerExtras`. The popover provides a single Save
 * action at the bottom; persistence + wire-mapping live in the hook,
 * not here.
 */
export function MastodonComposerControls( {
	visibility,
	onVisibilityChange,
	cwEnabled,
	onCwToggle,
	summary,
	onSummaryChange,
	onSave,
	headingId,
}: Props ) {
	const translate = useTranslate();
	const summaryRef = useRef< HTMLInputElement | null >( null );
	const previouslyEnabledRef = useRef( cwEnabled );

	useEffect( () => {
		if ( cwEnabled && ! previouslyEnabledRef.current ) {
			summaryRef.current?.focus();
		}
		previouslyEnabledRef.current = cwEnabled;
	}, [ cwEnabled ] );

	return (
		<VStack spacing={ 4 } className="mastodon-composer-controls">
			<h2 id={ headingId } className="mastodon-composer-controls__heading">
				{ translate( 'Post visibility and content warning' ) }
			</h2>
			<VisibilityCwControls< MastodonVisibility >
				className="mastodon-composer-controls__cw"
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
				summaryInputRef={ summaryRef }
			/>
			<Button variant="primary" onClick={ onSave }>
				{ translate( 'Save' ) }
			</Button>
		</VStack>
	);
}
