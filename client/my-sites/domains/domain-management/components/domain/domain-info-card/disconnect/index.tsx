import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import { type as domainType } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { domainManagementList, isUnderDomainSiteContext } from 'calypso/my-sites/domains/paths';
import { showSitesPage } from 'calypso/sites/components/sites-dashboard';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { markAsPendingMove } from 'calypso/state/sites/domains/actions';
import DomainInfoCard from '..';
import type { DisconnectDomainResult } from './types';
import type { DomainInfoCardProps } from '../types';

const DisconnectDomainCard = ( { domain, selectedSite }: DomainInfoCardProps ) => {
	const disconnectableTypes = [ domainType.REGISTERED ] as const;
	const [ isDialogVisible, setDialogVisible ] = useState( false );
	const [ isDisconnecting, setDisconnecting ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentRoute = useSelector( getCurrentRoute );

	if (
		! domain ||
		! domain.currentUserIsOwner ||
		domain.isMoveToNewSitePending ||
		! selectedSite ||
		selectedSite.options?.is_domain_only ||
		! disconnectableTypes.includes( domain.type )
	) {
		return null;
	}

	const clickCloseDialog = () => {
		setDialogVisible( false );
	};

	const showErrorNotice = ( message?: string ) => {
		const genericErrorMessage = translate(
			'An error occurred when disconnecting the domain from the site. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
			{
				components: {
					contactSupportLink: <a href={ CALYPSO_CONTACT } />,
				},
			}
		);

		dispatch( errorNotice( message ?? genericErrorMessage ) );
		setDisconnecting( false );
		setDialogVisible( false );
	};

	const clickDisconnectDomain = async () => {
		try {
			setDisconnecting( true );

			const result: DisconnectDomainResult = await wpcom.req.get(
				`/domains/${ domain.name }/disconnect-domain-from-site`
			);

			if ( ! result.success ) {
				showErrorNotice( result.error_description );
				return;
			}

			dispatch(
				successNotice(
					translate( 'The domain will be detached from this site in a few minutes.' ),
					{
						duration: 10000,
						isPersistent: true,
					}
				)
			);

			await new Promise( ( resolve ) => setTimeout( resolve, 7000 ) );

			dispatch( markAsPendingMove( selectedSite.ID, domain.name ) );

			setDisconnecting( false );
			setDialogVisible( false );

			if ( isUnderDomainSiteContext( currentRoute ) ) {
				showSitesPage( '/sites' );
			} else {
				page( domainManagementList( selectedSite.slug, currentRoute ) );
			}
		} catch ( e: any ) {
			showErrorNotice( e?.message );
		}
	};

	const buttons = [
		{
			action: 'close',
			label: translate( 'Cancel' ),
			onClick: clickCloseDialog,
			disabled: isDisconnecting,
		},
		{
			action: 'disconnect',
			label: translate( 'Detach' ),
			onClick: clickDisconnectDomain,
			additionalClassNames: isDisconnecting ? 'is-busy' : '',
			isPrimary: true,
		},
	];

	const renderDialog = () => {
		return (
			<Dialog buttons={ buttons } isVisible={ isDialogVisible } onClose={ clickCloseDialog }>
				<div className="dialog__grid">
					<div className="dialog__grid-column">
						<FormSectionHeading>
							{ translate( '{{strong}}Detach %(domain)s{{/strong}}', {
								args: { domain: domain.name },
								components: { strong: <strong /> },
							} ) }
						</FormSectionHeading>
						<p>
							{ translate( 'Are you sure? This will detach the domain from its current site.' ) }
						</p>
					</div>
				</div>
			</Dialog>
		);
	};

	return (
		<>
			<DomainInfoCard
				type="click"
				title={ translate( 'Detach' ) }
				description={ translate( 'Detach this domain from the site' ) }
				onClick={ () => setDialogVisible( true ) }
				ctaText={ translate( 'Detach' ) }
			/>
			{ renderDialog() }
		</>
	);
};

export default DisconnectDomainCard;
