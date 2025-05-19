import { useMutation } from '@tanstack/react-query';
import { __experimentalHeading as Heading, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { restoreSitePlanSoftwareMutation } from '../../app/queries';
import { ActionList } from '../../components/action-list';
import { DotcomFeatures } from '../../data/constants';
import type { Site } from '../../data/types';

const useRestorePlanSoftware = ( { slug, options }: Site ) => {
	const mutation = useMutation( restoreSitePlanSoftwareMutation( slug ) );

	if ( ! options?.is_wpcom_atomic ) {
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

const useDuplicateSite = ( { capabilities, plan, slug }: Site ) => {
	if (
		! ( capabilities.manage_options && plan?.features.active.includes( DotcomFeatures.COPY_SITE ) )
	) {
		return null;
	}

	return {
		title: __( 'Duplicate site' ),
		description: __( 'Create a duplicate of this site.' ),
		actions: (
			<Button
				variant="secondary"
				size="compact"
				href={ addQueryArgs( '/setup/copy-site', {
					sourceSlug: slug,
				} ) }
			>
				{ __( 'Duplicate' ) }
			</Button>
		),
	};
};

export default function SiteActions( { site }: { site: Site } ) {
	const restorePlanSoftware = useRestorePlanSoftware( site );
	const duplicateSite = useDuplicateSite( site );
	const actions = [ restorePlanSoftware, duplicateSite ].filter( ( value ) => !! value );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<>
			<Heading>{ __( 'Actions' ) }</Heading>
			<ActionList>
				{ actions.map( ( action, i ) => (
					<ActionList.ActionItem key={ i } { ...action } />
				) ) }
			</ActionList>
		</>
	);
}
