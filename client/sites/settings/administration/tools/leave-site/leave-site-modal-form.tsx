import page from '@automattic/calypso-router';
import {
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';
import { leaveSite } from 'calypso/state/sites/actions';
import { getSite, getSiteDomain, getSiteSlug } from 'calypso/state/sites/selectors';
import useQueryUsersMeBySiteId from './use-query-users-me-by-site-id';
import type { AppState } from 'calypso/types';
import './leave-site-modal-form.scss';

interface LeaveSiteModalFormProps {
	siteId: number;
	onSuccess?: () => void;
	onClose?: () => void;
}

const LeaveSiteModalForm = ( { siteId, onSuccess, onClose }: LeaveSiteModalFormProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isChecked, setChecked ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const wpcomUserId = useSelector( ( state: AppState ) => getCurrentUserId( state ) );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	const siteDomain = useSelector( ( state: AppState ) => getSiteDomain( state, siteId ) || '' );
	const siteOwnerId = useSelector( ( state: AppState ) => getSite( state, siteId )?.site_owner );
	const sitePurchasesLoaded = useSelector( ( state: AppState ) =>
		hasLoadedSitePurchasesFromServer( state )
	);

	const hasActiveCancelableSubscriptions = useSelector( ( state: AppState ) =>
		hasCancelableSitePurchases( state, siteId, wpcomUserId )
	);

	// It gets external user ID (ID of user entity from site connected via Jetpack) from provided WPCOM user ID.
	const { data: user } = useQueryUsersMeBySiteId( siteId );

	const isSiteOwner = wpcomUserId === siteOwnerId;

	const handleLeaveSite = async () => {
		if ( ! user?.id || ! isChecked ) {
			return;
		}

		recordTracksEvent( 'calypso_leave_site_modal_form_leave_site_click' );
		setIsSubmitting( true );
		try {
			const result = await dispatch( leaveSite( siteId, user?.id ) );
			if ( result ) {
				page.redirect( '/sites' );
				onSuccess?.();
				onClose?.();
			}
		} finally {
			setIsSubmitting( false );
		}
	};

	const renderBody = () => {
		if ( hasActiveCancelableSubscriptions ) {
			return (
				<p>
					{ translate(
						'You have active subscriptions associated with this site. These must be cancelled before you can leave the site.'
					) }
				</p>
			);
		}

		if ( isSiteOwner ) {
			return (
				<p>
					{ translate(
						'You are the owner of this site. To leave you must first transfer ownership to another account.'
					) }
				</p>
			);
		}

		return (
			<>
				<p>
					{ translate( 'Are you sure to leave the site {{b}}%(siteDomain)s{{/b}}?', {
						args: { siteDomain },
						components: {
							b: <b />,
						},
						comment: '%(siteDomain)s is the site domain',
					} ) }
				</p>
				<p>
					{ translate(
						'Leaving will remove your access to the site, including all content, users, domains, upgrades, and anything else you have access to.'
					) }
				</p>
				<p>
					{ translate(
						'To regain access, a current administrator must re-invite you. Please confirm this is your intent before proceeding.'
					) }
				</p>
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ translate( 'I understand the consequences of leaving' ) }
					checked={ isChecked }
					disabled={ isSubmitting }
					onChange={ setChecked }
				/>
			</>
		);
	};

	const renderPrimaryAction = () => {
		if ( hasActiveCancelableSubscriptions ) {
			return (
				<Button
					__next40pxDefaultSize
					variant="primary"
					href={ `/purchases/subscriptions/${ siteSlug }` }
					onClick={ () =>
						recordTracksEvent( 'calypso_leave_site_modal_form_manage_purchases_click' )
					}
				>
					{ translate( 'Manage purchases' ) }
				</Button>
			);
		}

		if ( isSiteOwner ) {
			return (
				<Button
					__next40pxDefaultSize
					variant="primary"
					href={ `/sites/settings/site/${ siteSlug }/transfer-site` }
					onClick={ () =>
						recordTracksEvent( 'calypso_leave_site_modal_form_transfer_ownership_click' )
					}
				>
					{ translate( 'Transfer ownership' ) }
				</Button>
			);
		}

		return (
			<Button
				__next40pxDefaultSize
				variant="primary"
				disabled={ ! user?.id || ! isChecked || isSiteOwner || hasActiveCancelableSubscriptions }
				isBusy={ isSubmitting }
				onClick={ handleLeaveSite }
			>
				{ translate( 'Leave site' ) }
			</Button>
		);
	};

	return (
		<form
			className="leave-site-modal__form"
			onSubmit={ ( event ) => {
				event.preventDefault();
				handleLeaveSite();
			} }
		>
			{ ! sitePurchasesLoaded && <QuerySitePurchases siteId={ siteId } /> }
			<VStack spacing={ ! isSiteOwner && ! hasActiveCancelableSubscriptions ? 6 : 0 }>
				<VStack spacing={ 0 }>{ renderBody() }</VStack>
				<Flex justify="flex-end" expanded={ false }>
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ isSubmitting }
							onClick={ onClose }
						>
							{ translate( 'Cancel' ) }
						</Button>
					</FlexItem>
					<FlexItem>{ renderPrimaryAction() }</FlexItem>
				</Flex>
			</VStack>
		</form>
	);
};

export default LeaveSiteModalForm;
