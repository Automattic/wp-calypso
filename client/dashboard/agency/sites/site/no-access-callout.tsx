import { Button, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import requestWpAdminAccessImage from 'calypso/assets/images/a8c-for-agencies/request-wp-admin-access-illustration.svg';
import { useAnalytics } from '../../../app/analytics';
import { Callout } from '../../../components/callout';
import EmptyState from '../../../components/empty-state';

const TEAM_MEMBER_PERMISSIONS_URL =
	'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#allowing-team-members-to-access-wp-admin';

export default function NoAccessCallout() {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );

	const callout = (
		<Callout
			titleAs="h2"
			image={
				<div style={ { minHeight: '260px' } }>
					<img src={ requestWpAdminAccessImage } alt="" />
				</div>
			}
			title={ __( 'Request WP-Admin access' ) }
			description={
				<Text variant="muted">
					{ __(
						'Ask the Agency owner to provide you WP-Admin access to this site in order to access and manage this site’s features.'
					) }
				</Text>
			}
			actions={
				<Button
					variant="primary"
					size="compact"
					href={ TEAM_MEMBER_PERMISSIONS_URL }
					target="_blank"
					rel="noreferrer"
					onClick={ () => recordTracksEvent( 'calypso_a4a_team_learn_more_wp_admin_access_click' ) }
				>
					{ __( 'Learn more' ) }
				</Button>
			}
		/>
	);

	return isDesktop ? (
		<EmptyState.Wrapper>
			<div style={ { maxWidth: '680px' } }>{ callout }</div>
		</EmptyState.Wrapper>
	) : (
		callout
	);
}
