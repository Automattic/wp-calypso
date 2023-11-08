import { TranslateResult, translate as RawTranslateFn, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	AllowedStatusTypes as AllowedStatusType,
	AllowedTypes as AllowedRowType,
	SiteData,
} from '../../types';
import useIsMultisiteSupported from './use-is-multisite-supported';

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

const boost: TooltipGetter = {
	progress: ( translate ) => translate( 'Fetching Scores' ),
};

const ALL_TOOLTIPS: Partial< Record< AllowedRowType, TooltipGetter > > = {
	backup,
	scan,
	monitor,
	plugin,
	boost,
};

const useTooltip = ( type: AllowedRowType, rows: SiteData ): TranslateResult | undefined => {
	// Show "Not supported on multisite" when the the site is multisite and the product is Scan or
	// Backup and the site does not have a backup subscription https://href.li/?https://wp.me/pbuNQi-1jg
	const isMultisiteSupported = useIsMultisiteSupported( rows?.site?.value, type );

	const isAtomicSite = rows?.site?.value?.is_atomic;

	const translate = useTranslate();

	return useMemo( () => {
		const row = rows[ type ];
		if ( ! isMultisiteSupported ) {
			return translate( 'Not supported on multisite' );
		}

		if ( isAtomicSite && ( type === 'site' || type === 'monitor' ) ) {
			return translate( 'Monitoring is managed by WordPress.com' );
		}

		return ALL_TOOLTIPS[ type ]?.[ row?.status ]?.( translate );
	}, [ isAtomicSite, isMultisiteSupported, rows, translate, type ] );
};

export default useTooltip;
