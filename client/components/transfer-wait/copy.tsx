import { useTranslate } from 'i18n-calypso';
import type { InstallStageKey } from './get-install-stage';
import type { ReactNode } from 'react';

/**
 * The title for each stage, used as the progress bar's aria-label.
 */
export function useStageTitles(): Record< InstallStageKey, ReactNode > {
	const translate = useTranslate();
	return {
		preparing: translate( 'Preparing a dedicated server for your site' ),
		moving: translate( 'Moving your site to its new server' ),
		finishing: translate( 'Finishing up' ),
	};
}

/**
 * One narrated sentence per stage, with the key phrase emphasized.
 */
export function useStageSentences( isPluginInstall = true ): Record< InstallStageKey, ReactNode > {
	const translate = useTranslate();
	return {
		preparing: translate(
			'We’re {{strong}}preparing a dedicated server for your site{{/strong}}.',
			{
				components: { strong: <strong /> },
			}
		),
		moving: translate(
			'We’re {{strong}}moving your site to the new server{{/strong}}. Content, media, and settings come along.',
			{
				components: { strong: <strong /> },
			}
		),
		finishing: isPluginInstall
			? translate(
					'{{strong}}Finishing up{{/strong}}. We’re installing and activating your plugin.',
					{
						components: { strong: <strong /> },
					}
			  )
			: translate( '{{strong}}Finishing up{{/strong}}. We’re making sure your site is ready.', {
					components: { strong: <strong /> },
			  } ),
	};
}

/**
 * Once the wait is long enough that reassurance stops being honest: the transfer is done and the
 * site is usable, so say that and point at the door rather than repeat that nothing is wrong.
 */
export function useStalledCopy() {
	const translate = useTranslate();
	return translate(
		'This is taking longer than it should. Your site is ready — your plugin may still finish installing on its own.'
	);
}

export function useStalledActionLabel() {
	const translate = useTranslate();
	return translate( 'Go to your plugins' );
}

export function useOverrunCopy() {
	const translate = useTranslate();
	return translate(
		'This step is taking longer than usual. We’re still working on it — nothing is wrong.'
	);
}
