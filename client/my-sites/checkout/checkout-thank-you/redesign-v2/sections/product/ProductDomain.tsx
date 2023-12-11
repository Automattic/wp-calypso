import { Button, ClipboardButton } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { domainManagementList, domainManagementRoot } from 'calypso/my-sites/domains/paths';

import './style.scss';

type ProductDomainProps = {
	domain: string;
	shareSite?: boolean;
	siteSlug?: string | null;
};

const ProductDomain = ( { domain, shareSite, siteSlug }: ProductDomainProps ) => {
	const [ isCopying, setIsCopying ] = useState( false );
	const handleShareSite = ( processing: boolean ) => () => {
		setIsCopying( processing );
	};
	return (
		<div className="checkout-thank-you__header-details">
			<div className="checkout-thank-you__header-details-content">
				<>
					<div className="checkout-thank-you__header-details-content-name">{ domain }</div>
				</>
			</div>
			<div className="checkout-thank-you__header-details-buttons">
				{ shareSite && (
					<ClipboardButton
						// @ts-expect-error The button props are passed into a Button component internally, but the types don't account that.
						variant="primary"
						onCopy={ handleShareSite( true ) }
						onFinishCopy={ handleShareSite( false ) }
						text={ domain }
					>
						{ isCopying ? translate( 'Site copied' ) : translate( 'Share site' ) }
					</ClipboardButton>
				) }
				<Button
					variant={ shareSite ? 'secondary' : 'primary' }
					href={ siteSlug ? domainManagementList( siteSlug ) : domainManagementRoot() }
				>
					{ translate( 'Manage domains' ) }
				</Button>
			</div>
		</div>
	);
};

export default ProductDomain;
