import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { restoreSitePlanSoftwareMutation } from '../../app/queries';
import { DotcomFeatures } from '../../data/constants';
import type { Site } from '../../data/types';

const useRestorePlanSoftware = ( { slug, options }: Site ) => {
	const mutation = useMutation( restoreSitePlanSoftwareMutation( slug ) );

	if ( ! options.is_wpcom_atomic ) {
		return null;
	}

	return {
		title: __( 'Re-install plugins & themes' ),
		description: __(
			'If your website is missing plugins and themes that come with your plan you can re-install them here.'
		),
		actions: (
			<Button
				variant="secondary"
				size="compact"
				isBusy={ mutation.isPending }
				onClick={ () => mutation.mutate() }
			>
				{ __( 'Restore' ) }
			</Button>
		),
	};
};

const useCopySite = ( { capabilities, is_wpcom_staging_site, plan, slug }: Site ) => {
	if (
		! (
			capabilities.manage_options &&
			! is_wpcom_staging_site &&
			plan?.features.active.includes( DotcomFeatures.COPY_SITE )
		)
	) {
		return null;
	}

	return {
		title: __( 'Copy site' ),
		description: __( 'Copy this site with all of its data to a new site.' ),
		actions: (
			<Button
				variant="secondary"
				size="compact"
				href={ addQueryArgs( '/setup/copy-site', {
					sourceSlug: slug,
				} ) }
			>
				{ __( 'Copy' ) }
			</Button>
		),
	};
};

const useActions = ( { site }: { site: Site } ) => {
	const restorePlanSoftware = useRestorePlanSoftware( site );
	const copySite = useCopySite( site );

	return [ restorePlanSoftware, copySite ].filter( Boolean );
};

export default useActions;
