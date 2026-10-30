import { siteBySlugQuery, siteWordPressMigrationHandoffMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, copy, shield } from '@wordpress/icons';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { getSiteDisplayName } from '../../utils/site-name';
import { getShareAccessUrl } from './assisted-wordpress';
import { IconList, MigrationCard, StatusIcon } from './wordpress/migration-card';

const WHAT_OUR_TEAM_DOES = [
	{
		icon: copy,
		text: __( 'We copy your whole site over, without touching the live one.' ),
	},
	{
		icon: shield,
		text: __( 'We scan it for security issues and malware, and clean up what we find.' ),
	},
	{
		icon: check,
		text: __( 'We check that every page and file made it across.' ),
	},
];

/**
 * What handing a WordPress migration to our team means, before the customer does it.
 */
export default function AssistedIntro( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const handOff = useMutation(
		withSnackbar( siteWordPressMigrationHandoffMutation( site.ID ), {
			error: __( 'We couldn’t send your migration to our team. Please try again.' ),
		} )
	);

	// Straight on to sharing access, so getting our team started takes one click.
	const handOffToOurTeam = () =>
		handOff.mutate( undefined, {
			onSuccess: ( migration ) =>
				window.location.assign( getShareAccessUrl( site, migration.source_url ) ),
		} );

	return (
		<PageLayout size="small" header={ <PageHeader title={ getSiteDisplayName( site ) } /> }>
			<MigrationCard
				title={ __( 'Let our team migrate your site' ) }
				decoration={ <StatusIcon status="team" /> }
				description={ __(
					'Sit back while our migration specialists move your site for you. It’s included in your plan, and most migrations are ready within 2–3 business days.'
				) }
				actions={
					<>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ handOff.isPending }
							// Stays off while the page catches up with our team having it.
							disabled={ handOff.isPending || handOff.isSuccess }
							onClick={ handOffToOurTeam }
						>
							{ __( 'Have our team do it' ) }
						</Button>
						<RouterLinkButton
							__next40pxDefaultSize
							variant="secondary"
							to={ `/sites/${ siteSlug }/migration-overview` }
						>
							{ __( 'Continue on my own' ) }
						</RouterLinkButton>
					</>
				}
			>
				<IconList items={ WHAT_OUR_TEAM_DOES } />
			</MigrationCard>
		</PageLayout>
	);
}
