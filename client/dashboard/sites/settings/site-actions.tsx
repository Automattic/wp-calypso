import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { restoreSitePlanSoftwareMutation } from '../../app/queries';
import { ActionList } from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';
import { DotcomFeatures } from '../../data/constants';
import type { Site } from '../../data/types';

const canRestorePlanSoftware = ( { is_wpcom_atomic }: Site ) => is_wpcom_atomic;

const RestorePlanSoftware = ( { site }: { site: Site } ) => {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( restoreSitePlanSoftwareMutation( site.slug ) );

	const handleClick = () => {
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					__( 'Requested restoration of plugins and themes that come with your plan.' ),
					{ type: 'snackbar' }
				);
			},
			onError: () => {
				createErrorNotice( __( 'Failed to request restoration of plan plugin and themes.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<ActionList.ActionItem
			title={ __( 'Re-install plugins & themes' ) }
			description={ __(
				'If your website is missing plugins and themes that come with your plan you can re-install them here.'
			) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					isBusy={ mutation.isPending }
					onClick={ handleClick }
				>
					{ __( 'Restore' ) }
				</Button>
			}
		/>
	);
};

const canDuplicateSite = ( { capabilities, plan }: Site ) =>
	capabilities.manage_options && plan?.features.active.includes( DotcomFeatures.COPY_SITE );

const DuplicateSite = ( { site }: { site: Site } ) => {
	return (
		<ActionList.ActionItem
			title={ __( 'Duplicate site' ) }
			description={ __( 'Create a duplicate of this site.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ addQueryArgs( '/setup/copy-site', {
						sourceSlug: site.slug,
					} ) }
				>
					{ __( 'Duplicate' ) }
				</Button>
			}
		/>
	);
};

export default function SiteActions( { site }: { site: Site } ) {
	const actions = [
		canRestorePlanSoftware( site ) && (
			<RestorePlanSoftware key="restore-plan-software" site={ site } />
		),
		canDuplicateSite( site ) && <DuplicateSite key="duplicate-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Actions' ) } />
			<ActionList>{ actions }</ActionList>
		</VStack>
	);
}
