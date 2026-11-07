import { sitePlanSoftwareRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ActionList } from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';
import { wpcomLink } from '../../utils/link';
import { canViewSiteActions, canDuplicateSite } from '../features';
import type { Site } from '@automattic/api-core';

const RestorePlanSoftware = ( { site }: { site: Site } ) => {
	const mutation = useMutation(
		withSnackbar( sitePlanSoftwareRestoreMutation( site.ID ), {
			success: __(
				'Restoration requested. The plugins and themes included with your plan should be restored within a few minutes.'
			),
			error: __( 'Failed to request restoration of plan plugin and themes.' ),
		} )
	);

	let buttonLabel: string = __( 'Restore' );
	if ( mutation.isPending ) {
		buttonLabel = __( 'Requesting…' );
	} else if ( mutation.isSuccess ) {
		buttonLabel = __( 'Requested' );
	}

	const handleClick = () => {
		if ( mutation.isPending || mutation.isSuccess ) {
			return;
		}
		mutation.mutate( undefined );
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
					disabled={ mutation.isPending || mutation.isSuccess }
					onClick={ handleClick }
				>
					{ buttonLabel }
				</Button>
			}
		/>
	);
};

const DuplicateSite = ( { site }: { site: Site } ) => {
	return (
		<ActionList.ActionItem
			title={ __( 'Duplicate site' ) }
			description={ __( 'Create a duplicate of this site.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ addQueryArgs( wpcomLink( '/setup/copy-site' ), {
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
	const { user } = useAuth();

	if ( ! canViewSiteActions( site ) ) {
		return null;
	}

	const actions = [
		site.is_wpcom_atomic && (
			<RestorePlanSoftware key={ `restore-plan-software-${ site.ID }` } site={ site } />
		),
		canDuplicateSite( site, user ) && <DuplicateSite key="duplicate-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Actions' ) } level={ 3 } />
			<ActionList>{ actions }</ActionList>
		</VStack>
	);
}
