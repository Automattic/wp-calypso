import {
	__experimentalVStack as VStack,
	RadioControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useId } from 'react';
import type { FediverseVisibility } from '@automattic/api-core';

const SUMMARY_MAX_LENGTH = 100;

interface Props {
	visibility: FediverseVisibility;
	onVisibilityChange: ( value: FediverseVisibility ) => void;
	cwEnabled: boolean;
	onCwToggle: ( enabled: boolean ) => void;
	summary: string;
	onSummaryChange: ( value: string ) => void;
}

/**
 * The protocol-specific controls slotted between the composer textarea
 * and the footer for Fediverse:
 *  1. Visibility radio (public / unlisted / followers — `direct` is
 *     intentionally omitted, not yet supported backend-side per CM-704).
 *  2. Content-warning toggle + 100-char `summary` input (revealed when
 *     the toggle is on; maps to the AP `summary` field).
 *
 * AP `sensitive` flag (media-blur gate) was removed from the surface
 * while slice 2 has no media support — there's nothing for the flag to
 * gate. Re-introduce it alongside the media slot in a follow-up slice;
 * the wire type still carries `sensitive?: boolean` so the round-trip
 * stays stable.
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
	const summaryId = useId();

	const handleVisibility = useCallback(
		( next: string | undefined ) => {
			if ( next === 'public' || next === 'unlisted' || next === 'followers' ) {
				onVisibilityChange( next );
			}
		},
		[ onVisibilityChange ]
	);

	return (
		<VStack spacing={ 4 } className="fediverse-composer-controls">
			{ /*
			 * `label` + `help` are passed to RadioControl directly so its
			 * built-in `<fieldset><legend>` semantics carry the accessible
			 * group name (and the help id is wired via `aria-describedby`).
			 * Wrapping in BaseControl renders the visible "Visibility" label
			 * as a sibling that isn't associated with the radiogroup.
			 *
			 * Option labels mirror the ActivityPub plugin's wp-admin wording
			 * verbatim ("Public" / "Quiet public" / "Followers only" — see
			 * `wordpress-activitypub/integration/class-classic-editor.php`)
			 * so users see the same vocabulary in both surfaces. The wire
			 * value `'unlisted'` is preserved; only the visible label
			 * changed.
			 */ }
			<RadioControl
				label={ String( translate( 'Visibility' ) ) }
				help={ String(
					translate(
						'Public is shown to everyone. Quiet public hides the post from your followers’ feed but keeps it reachable by URL. Followers limits it to people who follow you.'
					)
				) }
				selected={ visibility }
				onChange={ handleVisibility }
				options={ [
					{ label: String( translate( 'Public' ) ), value: 'public' },
					{ label: String( translate( 'Quiet public' ) ), value: 'unlisted' },
					{ label: String( translate( 'Followers only' ) ), value: 'followers' },
				] }
			/>

			<ToggleControl
				__nextHasNoMarginBottom
				label={ String( translate( 'Add content warning' ) ) }
				checked={ cwEnabled }
				onChange={ onCwToggle }
			/>

			{ cwEnabled && (
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ summaryId }
					label={ String( translate( 'Content warning summary' ) ) }
					placeholder={ String( translate( 'Short description of the post’s content…' ) ) }
					value={ summary }
					onChange={ onSummaryChange }
					maxLength={ SUMMARY_MAX_LENGTH }
					help={ String(
						translate(
							'Shown above the post; readers can choose to expand. %(count)d of %(max)d characters used.',
							{
								args: { count: summary.length, max: SUMMARY_MAX_LENGTH },
								comment:
									'Live character count for the optional content-warning summary input on the Fediverse composer.',
							}
						)
					) }
				/>
			) }
		</VStack>
	);
}

export { SUMMARY_MAX_LENGTH };
