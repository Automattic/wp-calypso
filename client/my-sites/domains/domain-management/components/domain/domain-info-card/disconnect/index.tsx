import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import wpcom from 'calypso/lib/wp';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import DomainInfoCard from '..';
import type { DomainInfoCardProps } from '../types';

const DisconnectDomainCard = ( { domain, selectedSite }: DomainInfoCardProps ) => {
	const [ isDialogVisible, setDialogVisible ] = useState( false );
	const translate = useTranslate();

	if ( ! domain.currentUserIsOwner ) {
		return null;
	}

	const clickCloseDialog = () => {
		setDialogVisible( false );
	};

	const clickDisconnectDomain = async () => {
		const data = await wpcom.req.get(
			`/domains/${ domain.name }/disconnect-domain-from-site/${ selectedSite.ID }`
		);

		page.redirect( domainManagementEdit( data.siteId, domain.name ) );

		setDialogVisible( false );
	};

	const buttons = [
		{
			action: 'close',
			label: translate( 'Cancel' ),
			onClick: clickCloseDialog,
		},
		{
			action: 'disconnect',
			label: translate( 'Disconnect domain' ),
			onClick: clickDisconnectDomain,
			isPrimary: true,
		},
	];

	const renderDialog = () => {
		return (
			<Dialog buttons={ buttons } isVisible={ isDialogVisible } onClose={ clickCloseDialog }>
				<div className="dialog__grid">
					<div className="dialog__grid-column">
						<FormattedHeader
							brandFont
							headerText={ translate( 'Are you sure you want to disconnect %(domain)s?', {
								args: { domain: domain.name },
							} ) }
							align="left"
						/>
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
