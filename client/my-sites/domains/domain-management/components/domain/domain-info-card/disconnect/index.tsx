import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import wpcom from 'calypso/lib/wp';
import { domainManagementAllRoot, domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import DomainInfoCard from '..';
import type { DomainInfoCardProps } from '../types';

const DisconnectDomainCard = ( { domain, selectedSite }: DomainInfoCardProps ) => {
	const [ isDialogVisible, setDialogVisible ] = useState( false );
	const [ isDisconnecting, setDisconnecting ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();

	if (
		! domain ||
		! domain.currentUserIsOwner ||
		! selectedSite ||
		selectedSite.options?.is_domain_only
	) {
		return null;
	}

	const clickCloseDialog = () => {
		setDialogVisible( false );
	};

	const clickDisconnectDomain = async () => {
		setDisconnecting( true );
		const data = await wpcom.req.get(
			`/domains/${ domain.name }/disconnect-domain-from-site/${ selectedSite.ID }`
		);

		await Promise.all( [
			dispatch( requestSite( data.blog_id ) ),
			dispatch( requestSite( selectedSite.ID ) ),
		] );

		await Promise.all( [
			dispatch( fetchSiteDomains( selectedSite.ID ) ),
			dispatch( fetchSiteDomains( data.blog_id ) ),
		] );

		setDisconnecting( false );

		page.redirect(
			domainManagementEdit( data.blog_id, domain.name, domainManagementAllRoot() + '/' )
		);

		setDialogVisible( false );
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
			label: translate( 'Disconnect' ),
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
							{ translate( '{{strong}}Disconnect %(domain)s{{/strong}}', {
								args: { domain: domain.name },
								components: { strong: <strong /> },
							} ) }
						</FormSectionHeading>
						<p>
							{ translate(
								'Are you sure? This will disconnect the domain from its current site.'
							) }
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
				title="Disconnect"
				description="Disconnect this domain from the site"
				onClick={ () => setDialogVisible( true ) }
				ctaText="Disconnect"
			/>
			{ renderDialog() }
		</>
	);
};

export default DisconnectDomainCard;
