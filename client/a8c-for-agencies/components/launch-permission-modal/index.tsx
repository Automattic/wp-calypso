import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const LEARN_MORE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#allowing-team-members-to-access-wp-admin';

interface Props {
	onClose: () => void;
	source: 'sites' | 'licenses';
}

/**
 * Explains why a team member without site admin access can't launch a site.
 *
 * Rendered as the body of a modal on both the Sites Dashboard and the Licenses
 * area. The modal chrome (and title) is supplied by the surface that mounts it.
 */
export default function LaunchPermissionModal( { onClose, source }: Props ) {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_prepare_for_launch_no_permission', { source } ) );
	}, [ dispatch, source ] );

	const onLearnMoreClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_prepare_for_launch_no_permission_learn_more', { source } )
		);
		showSupportGuide( LEARN_MORE_URL );
	};

	return (
		<VStack spacing={ 6 }>
			<Text as="p">
				{ __(
					'To launch this site, sign in with the agency owner account, or ask the owner to add you as an administrator. The account must also be connected to WordPress.com to manage the site there.'
				) }
			</Text>
			<HStack justify="space-between">
				<Button variant="link" onClick={ onLearnMoreClick }>
					{ __( 'Learn more about team member permissions' ) }
				</Button>
				<Button __next40pxDefaultSize variant="primary" onClick={ onClose }>
					{ __( 'Got it' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
