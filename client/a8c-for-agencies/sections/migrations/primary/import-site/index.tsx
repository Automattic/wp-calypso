import { STATIC_SITE_IMPORT_TERMINAL_STATES } from '@automattic/api-core';
import {
	createStaticSiteImportSessionMutation,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MIGRATIONS_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';

import './style.scss';

/**
 * Follows one import after its dev site is created, until the server has delivered it or given up.
 */
function ImportProgress( {
	sessionId,
	onStartAgain,
}: {
	sessionId: string;
	onStartAgain: () => void;
} ) {
	const translate = useTranslate();
	const { data: session, isError } = useQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		refetchInterval: pollStaticSiteImportSessionUntil( STATIC_SITE_IMPORT_TERMINAL_STATES ),
	} );

	if ( isError || session?.state === 'failed' ) {
		return (
			<div className="a4a-import-site__status">
				<h2>{ translate( "We couldn't move this site" ) }</h2>
				<p>
					{ translate(
						'Your development site was created, but the import did not finish. Start again with the address to try once more.'
					) }
				</p>
				<Button variant="primary" onClick={ onStartAgain }>
					{ translate( 'Start again' ) }
				</Button>
			</div>
		);
	}

	if ( session?.state === 'finished' ) {
		return (
			<div className="a4a-import-site__status">
				<h2>{ translate( 'Your site is ready to review' ) }</h2>
				<p>
					{ translate(
						'The import is on your development site. Review it, then launch it when the client is ready.'
					) }
				</p>
				<div className="a4a-import-site__actions">
					{ session.site_url && (
						<Button variant="primary" href={ session.site_url } target="_blank" rel="noreferrer">
							{ translate( 'Review the site' ) }
						</Button>
					) }
					<Button variant="secondary" href={ A4A_SITES_LINK }>
						{ translate( 'Go to Sites' ) }
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="a4a-import-site__status">
			<h2>
				<Spinner />
				{ translate( 'Moving your site' ) }
			</h2>
			<p>
				{ translate(
					'We are building it on your new development site. This usually takes a few minutes. You can leave this page: the site is in Sites, and we email you if the move fails.'
				) }
			</p>
		</div>
	);
}

/**
 * Moves a site from another platform onto a new dev site: the import starts here, and the
 * server delivers it onto the dev site once the site exists and the build lands.
 */
export default function ImportSite() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ importSessionId, setImportSessionId ] = useState< string >();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isSiteCreated, setIsSiteCreated ] = useState( false );
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();
	const onCreated = useCallback( () => setIsSiteCreated( true ), [] );
	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName, onCreated );
	const { mutate: createSession, isPending } = useMutation(
		createStaticSiteImportSessionMutation()
	);

	const title = translate( 'Move a site from another platform' );

	const startAgain = () => {
		setIsSiteCreated( false );
		setImportSessionId( undefined );
	};

	const onSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_import_site_submit' ) );
		createSession( sourceUrl.trim(), {
			onSuccess: ( session ) => {
				setImportSessionId( session.session_id );
				setIsModalOpen( true );
			},
			onError: ( error ) =>
				dispatch(
					errorNotice( error.message || translate( 'Something went wrong. Please try again.' ) )
				),
		} );
	};

	return (
		<Layout className="a4a-import-site" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{ label: translate( 'Migrations' ), href: A4A_MIGRATIONS_LINK },
							{ label: title },
						] }
					/>
					<Title>{ title }</Title>
					<Subtitle>
						{ translate(
							'Enter the address of a Wix, Squarespace, or other non-WordPress site. We build it on a free development site you can review before you pay.'
						) }
					</Subtitle>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ importSessionId && isSiteCreated ? (
					<ImportProgress sessionId={ importSessionId } onStartAgain={ startAgain } />
				) : (
					<form className="a4a-import-site__form" onSubmit={ onSubmit }>
						<FormField label={ translate( 'Site address' ) } labelFor="a4a-import-site-url">
							<FormTextInput
								id="a4a-import-site-url"
								type="url"
								required
								placeholder="https://example.com"
								value={ sourceUrl }
								disabled={ isPending }
								onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
									setSourceUrl( event.target.value )
								}
							/>
						</FormField>
						<Button variant="primary" type="submit" isBusy={ isPending } disabled={ isPending }>
							{ translate( 'Continue' ) }
						</Button>
					</form>
				) }
			</LayoutBody>

			{ importSessionId && isModalOpen && (
				<SiteConfigurationsModal
					closeModal={ () => setIsModalOpen( false ) }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
					importSessionId={ importSessionId }
				/>
			) }
		</Layout>
	);
}
