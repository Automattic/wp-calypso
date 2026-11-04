import { createStaticSiteImportSessionMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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
 * Moves a site from another platform onto a new dev site: the import starts here, and the
 * server delivers it onto the dev site once the site exists and the build lands.
 */
export default function ImportSite() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ importSessionId, setImportSessionId ] = useState< string >();
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();
	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );
	const { mutate: createSession, isPending } = useMutation(
		createStaticSiteImportSessionMutation()
	);

	const title = translate( 'Move a site from another platform' );

	const onSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_import_site_submit' ) );
		createSession( sourceUrl.trim(), {
			onSuccess: ( session ) => setImportSessionId( session.session_id ),
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
			</LayoutBody>

			{ importSessionId && (
				<SiteConfigurationsModal
					closeModal={ () => setImportSessionId( undefined ) }
					randomSiteName={ randomSiteName }
					isRandomSiteNameLoading={ isRandomSiteNameLoading }
					onCreateSiteSuccess={ onCreateSiteSuccess }
					importSessionId={ importSessionId }
				/>
			) }
		</Layout>
	);
}
