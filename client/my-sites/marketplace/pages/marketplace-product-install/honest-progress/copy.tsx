import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

/**
 * The words for the three honest stages, shared by both wait variants so the narration
 * stays identical whichever one is on screen.
 */
export function useHonestStageCopy() {
	const translate = useTranslate();
	return [
		{
			title: translate( 'Preparing a dedicated server for your site' ),
			description: translate( 'Your site is getting its own hardware — this is the longest part.' ),
		},
		{
			title: translate( 'Moving your site to its new server' ),
			description: translate( 'Content, media, and settings come along.' ),
		},
		{
			title: translate( 'Finishing up' ),
			description: translate( 'Installing and activating your plugin.' ),
		},
	];
}

/**
 * One narrated sentence per honest stage, with the key phrase emphasized. Used by the
 * card variant, which shows a single line rather than the full stage list.
 */
export function useHonestStageSentences(): ReactNode[] {
	const translate = useTranslate();
	return [
		translate( 'We’re {{strong}}preparing a dedicated server for your site{{/strong}}.', {
			components: { strong: <strong /> },
		} ),
		translate(
			'We’re {{strong}}moving your site to the new server{{/strong}}. Content, media, and settings come along.',
			{
				components: { strong: <strong /> },
			}
		),
		translate( '{{strong}}Finishing up{{/strong}}. We’re installing and activating your plugin.', {
			components: { strong: <strong /> },
		} ),
	];
}

export function useHonestFooterCopy() {
	const translate = useTranslate();
	return {
		elapsed: ( seconds: number ) =>
			translate( 'Elapsed: %(elapsed)d s · usually takes about a minute', {
				args: { elapsed: Math.floor( seconds ) },
				comment: '%(elapsed)d is a number of seconds; "s" is the unit abbreviation.',
			} ),
		overrun: translate(
			'This step is taking longer than usual. We’re still working on it — nothing is wrong.'
		),
		education: translate(
			'Why the wait? Your site is moving to its own dedicated server — that’s what makes premium plugins possible, and it only happens once.'
		),
	};
}
