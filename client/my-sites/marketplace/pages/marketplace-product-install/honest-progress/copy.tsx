import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

/**
 * The title for each honest stage, used as the progress bar's aria-label.
 */
export function useHonestStageTitles(): ReactNode[] {
	const translate = useTranslate();
	return [
		translate( 'Preparing a dedicated server for your site' ),
		translate( 'Moving your site to its new server' ),
		translate( 'Finishing up' ),
	];
}

/**
 * One narrated sentence per honest stage, with the key phrase emphasized.
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

export function useHonestOverrunCopy() {
	const translate = useTranslate();
	return translate(
		'This step is taking longer than usual. We’re still working on it — nothing is wrong.'
	);
}
