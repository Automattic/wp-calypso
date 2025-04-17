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
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';
import { leaveSite } from 'calypso/state/sites/actions';
import { getSite, getSiteDomain } from 'calypso/state/sites/selectors';
import LeaveSiteModalWarning from './leave-site-modal-warning';
import type { AppState } from 'calypso/types';
import './leave-site-modal-form.scss';

export interface LeaveSiteModalFormProps {
	siteId: number;
	onClose?: () => void;
}

const LeaveSiteModalForm = ( { siteId, onClose }: LeaveSiteModalFormProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isChecked, setChecked ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const userId = useSelector( ( state: AppState ) => getCurrentUserId( state ) );
	const siteDomain = useSelector( ( state: AppState ) => getSiteDomain( state, siteId ) || '' );
	const siteOwnerId = useSelector( ( state: AppState ) => getSite( state, siteId )?.site_owner );
	const sitePurchasesLoaded = useSelector( ( state: AppState ) =>
		hasLoadedSitePurchasesFromServer( state )
	);

	const hasActiveCancelableSubscriptions = useSelector( ( state: AppState ) =>
		hasCancelableSitePurchases( state, siteId )
	);

	const isSiteOwner = userId === siteOwnerId;

	const handleLeaveSite = async () => {
		if ( ! isChecked ) {
			return;
		}

		try {
			setIsSubmitting( true );
			const result = await dispatch( leaveSite( siteId ) );
			if ( result ) {
				page.redirect( '/sites' );
				onClose?.();
			}
		} finally {
			setIsSubmitting( false );
		}
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
			<VStack spacing={ 6 }>
				{ ( isSiteOwner || hasActiveCancelableSubscriptions ) && (
					<LeaveSiteModalWarning
						siteId={ siteId }
						isSiteOwner={ isSiteOwner }
						hasActiveCancelableSubscriptions={ hasActiveCancelableSubscriptions }
					/>
				) }
				<VStack spacing={ 0 }>
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
				</VStack>
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
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="primary"
							disabled={ ! isChecked || isSiteOwner || hasActiveCancelableSubscriptions }
							isBusy={ isSubmitting }
							onClick={ handleLeaveSite }
						>
							{ translate( 'Leave site' ) }
						</Button>
					</FlexItem>
				</Flex>
			</VStack>
		</form>
	);
};

export default LeaveSiteModalForm;
