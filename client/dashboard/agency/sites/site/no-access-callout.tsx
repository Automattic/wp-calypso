import { Button, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import requestWpAdminAccessImage from 'calypso/assets/images/a8c-for-agencies/request-wp-admin-access-illustration.svg';
import { Callout } from '../../../components/callout';
import EmptyState from '../../../components/empty-state';

const TEAM_MEMBER_PERMISSIONS_URL =
	'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#allowing-team-members-to-access-wp-admin';

export default function NoAccessCallout() {
	const isDesktop = useViewportMatch( 'medium' );

	const callout = (
		<Callout
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
					href={ TEAM_MEMBER_PERMISSIONS_URL }
					target="_blank"
					rel="noreferrer"
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
