import { isCustomDesign } from './is-custom-design';
import { isNoAds } from './is-no-ads';
import { isTieredVolumeSpaceAddon } from './is-tiered-volume-space-addon';
import { isUnlimitedThemes } from './is-unlimited-themes';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isAddOn( product: WithSnakeCaseSlug | WithCamelCaseSlug ): boolean {
	// Right now the definition of an "add-on" just comes from a hardcoded list.
	return (
		isCustomDesign( product ) ||
		isNoAds( product ) ||
		isUnlimitedThemes( product ) ||
		isTieredVolumeSpaceAddon( product )
	);
}
