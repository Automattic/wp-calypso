import { TranslateResult, translate as RawTranslateFn, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { AllowedStatusTypes as AllowedStatusType, AllowedTypes as AllowedRowType } from '../types';

type TooltipGetter = Partial<
	Record< AllowedStatusType, ( translate: typeof RawTranslateFn ) => TranslateResult >
>;

const backup: TooltipGetter = {
	critical: ( translate ) => translate( 'Latest backup failed' ),
	warning: ( translate ) => translate( 'Latest backup completed with warnings' ),
	inactive: ( translate ) => translate( 'Add Jetpack VaultPress Backup to this site' ),
	progress: ( translate ) => translate( 'Backup in progress' ),
	success: ( translate ) => translate( 'Latest backup completed successfully' ),
};

const scan: TooltipGetter = {
	failed: ( translate ) => translate( 'Potential threats found' ),
	inactive: ( translate ) => translate( 'Add Jetpack Scan to this site' ),
	progress: ( translate ) => translate( 'Scan in progress' ),
	success: ( translate ) => translate( 'No threats detected' ),
};

const monitor: TooltipGetter = {
	failed: ( translate ) => translate( 'Site appears to be offline' ),
	success: ( translate ) => translate( 'No downtime detected' ),
	disabled: ( translate ) => translate( 'Monitor is off' ),
};

const plugin: TooltipGetter = {
	warning: ( translate ) => translate( 'Plugin updates are available' ),
	success: ( translate ) => translate( 'No plugin updates found' ),
};

const ALL_TOOLTIPS: Partial< Record< AllowedRowType, TooltipGetter > > = {
	backup,
	scan,
	monitor,
	plugin,
};

const useTooltip = (
	type: AllowedRowType,
	status: AllowedStatusType
): TranslateResult | undefined => {
	const translate = useTranslate();

	return useMemo(
		() => ALL_TOOLTIPS[ type ]?.[ status ]?.( translate ),
		[ status, translate, type ]
	);
};

export default useTooltip;
