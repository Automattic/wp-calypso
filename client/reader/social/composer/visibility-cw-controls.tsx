import {
	__experimentalVStack as VStack,
	RadioControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useId } from 'react';

/**
 * Default upper bound on the content-warning summary. Matches the
 * Mastodon web client's UI cap and the Fediverse composer's
 * pre-extraction value. Per-protocol shells can override via the
 * `summaryMaxLength` prop.
 */
export const DEFAULT_SUMMARY_MAX_LENGTH = 100;

interface VisibilityOption< V extends string > {
	value: V;
	label: string;
}

export interface VisibilityCwControlsProps< V extends string > {
	visibility: V;
	onVisibilityChange: ( value: V ) => void;
	/**
	 * The radio options the user picks among. Caller supplies per-
	 * protocol values (Fediverse: `'public'/'unlisted'/'followers'`;
	 * Mastodon: `'public'/'unlisted'/'private'`) and pre-localised
	 * labels — option labels stay aligned to wp-admin / Mastodon web
	 * vocabulary, so the strings are owned by the protocol shell, not
	 * by this shared component.
	 */
	visibilityOptions: ReadonlyArray< VisibilityOption< V > >;
	cwEnabled: boolean;
	onCwToggle: ( enabled: boolean ) => void;
	summary: string;
	onSummaryChange: ( value: string ) => void;
	/**
	 * Optional override for the visibility radiogroup's accessible label
	 * + help text. Caller pre-localises. The defaults are protocol-
	 * agnostic copy that fits both AP- and Mastodon-shaped vocabularies.
	 */
	visibilityLabel?: string;
	visibilityHelp?: string;
	/** Optional override for the CW toggle label. Caller pre-localises. */
	cwToggleLabel?: string;
	/**
	 * Optional override for the CW summary input's label + placeholder +
	 * cap. Defaults to 100 characters (Mastodon web parity).
	 */
	summaryLabel?: string;
	summaryPlaceholder?: string;
	summaryMaxLength?: number;
	className?: string;
	/**
	 * Optional ref forwarded to the CW summary input. Per-protocol shells
	 * use this to move focus to the summary when CW first toggles on (e.g.
	 * inside a popover where the toggle and summary live together).
	 */
	summaryInputRef?: React.Ref< HTMLInputElement >;
}

/**
 * Protocol-agnostic visibility + content-warning controls slotted into
 * the composer between the textarea and the footer. Fediverse and
 * Mastodon both consume this via their `useProtocolExtras` hook (the
 * vocabularies converge — wp-admin's ActivityPub plugin and Mastodon's
 * web client use the same "Public" / "Quiet public" / "Followers only"
 * labels — so a single shared shell keeps the surface consistent).
 * Atmosphere does not (Bluesky's privacy model is different).
 *
 * The visibility wire values differ per protocol (Fediverse:
 * `'followers'`; Mastodon: `'private'`), so the caller supplies the
 * option list and the value type. The summary cap defaults to 100
 * characters to match the Mastodon web client.
 */
export function VisibilityCwControls< V extends string >( {
	visibility,
	onVisibilityChange,
	visibilityOptions,
	cwEnabled,
	onCwToggle,
	summary,
	onSummaryChange,
	visibilityLabel,
	visibilityHelp,
	cwToggleLabel,
	summaryLabel,
	summaryPlaceholder,
	summaryMaxLength = DEFAULT_SUMMARY_MAX_LENGTH,
	className,
	summaryInputRef,
}: VisibilityCwControlsProps< V > ) {
	const translate = useTranslate();
	const summaryId = useId();

	// Guard the `onChange` payload — the wrapped `string | undefined`
	// signature from `RadioControl` is wider than `V`. Re-creating the
	// handler each render is cheap (a single `.find()` over a three-
	// element array); we used to wrap it in `useCallback` but the per-
	// protocol wrappers all hand us a freshly-built `visibilityOptions`
	// literal (the labels go through `translate(…)`), so the memoization
	// never hit. Inline keeps the intent obvious.
	const handleVisibility = ( next: string | undefined ): void => {
		if ( next === undefined ) {
			return;
		}
		const matched = visibilityOptions.find( ( option ) => option.value === next );
		if ( matched ) {
			onVisibilityChange( matched.value );
		}
	};

	return (
		<VStack spacing={ 4 } className={ className }>
			{ /*
			 * `label` + `help` are passed to RadioControl directly so its
			 * built-in `<fieldset><legend>` semantics carry the accessible
			 * group name (and the help id is wired via `aria-describedby`).
			 * Wrapping in BaseControl renders the visible label as a sibling
			 * that isn't associated with the radiogroup.
			 */ }
			<RadioControl
				label={
					visibilityLabel !== undefined ? visibilityLabel : String( translate( 'Visibility' ) )
				}
				help={
					visibilityHelp !== undefined
						? visibilityHelp
						: String(
								translate(
									'Public is shown to everyone. Quiet public is hidden from public timelines and search but still appears in your followers’ feed and is reachable by URL. Followers limits it to people who follow you.'
								)
						  )
				}
				selected={ visibility }
				onChange={ handleVisibility }
				options={ visibilityOptions.map( ( option ) => ( {
					value: option.value,
					label: option.label,
				} ) ) }
			/>

			<ToggleControl
				__nextHasNoMarginBottom
				label={
					cwToggleLabel !== undefined ? cwToggleLabel : String( translate( 'Add content warning' ) )
				}
				checked={ cwEnabled }
				onChange={ onCwToggle }
			/>

			{ cwEnabled && (
				<TextControl
					ref={ summaryInputRef }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ summaryId }
					label={
						summaryLabel !== undefined
							? summaryLabel
							: String( translate( 'Content warning summary' ) )
					}
					placeholder={
						summaryPlaceholder !== undefined
							? summaryPlaceholder
							: String( translate( 'Short description of the post’s content…' ) )
					}
					value={ summary }
					onChange={ onSummaryChange }
					maxLength={ summaryMaxLength }
					help={ String(
						translate(
							'Shown above the post; readers can choose to expand. %(count)d of %(max)d characters used.',
							{
								args: { count: summary.length, max: summaryMaxLength },
								comment:
									'Live character count for the optional content-warning summary input on the social composer.',
							}
						)
					) }
				/>
			) }
		</VStack>
	);
}
