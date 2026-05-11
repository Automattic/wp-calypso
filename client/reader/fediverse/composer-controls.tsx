import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	BaseControl,
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
	sensitive: boolean;
	onSensitiveToggle: ( value: boolean ) => void;
	disabled?: boolean;
}

/**
 * The three protocol-specific controls slotted between the composer
 * textarea and the footer for Fediverse:
 *  1. Visibility radio (public / unlisted / followers — `direct` is
 *     intentionally omitted, not yet supported backend-side per CM-704).
 *  2. Content-warning toggle + 100-char `summary` input (revealed when
 *     the toggle is on; maps to the AP `summary` field).
 *  3. Sensitive flag (AP `sensitive` boolean; media-blur gate, exposed
 *     now so the composer shape stays stable when media support lands).
 */
export function FediverseComposerControls( {
	visibility,
	onVisibilityChange,
	cwEnabled,
	onCwToggle,
	summary,
	onSummaryChange,
	sensitive,
	onSensitiveToggle,
	disabled,
}: Props ) {
	const translate = useTranslate();
	const visibilityId = useId();
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
		<VStack
			spacing={ 4 }
			className="fediverse-composer-controls"
			aria-disabled={ disabled || undefined }
		>
			<BaseControl
				__nextHasNoMarginBottom
				id={ visibilityId }
				label={ String( translate( 'Visibility' ) ) }
				help={ String(
					translate(
						'Public is shown to everyone. Unlisted hides the post from your followers’ feed but keeps it reachable by URL. Followers limits it to people who follow you.'
					)
				) }
			>
				<RadioControl
					selected={ visibility }
					onChange={ handleVisibility }
					options={ [
						{ label: String( translate( 'Public' ) ), value: 'public' },
						{ label: String( translate( 'Unlisted' ) ), value: 'unlisted' },
						{ label: String( translate( 'Followers only' ) ), value: 'followers' },
					] }
				/>
			</BaseControl>

			<HStack justify="flex-start" spacing={ 4 } wrap>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ String( translate( 'Add content warning' ) ) }
					checked={ cwEnabled }
					onChange={ onCwToggle }
					disabled={ disabled }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ String( translate( 'Mark media as sensitive' ) ) }
					checked={ sensitive }
					onChange={ onSensitiveToggle }
					disabled={ disabled }
				/>
			</HStack>

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
					disabled={ disabled }
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
