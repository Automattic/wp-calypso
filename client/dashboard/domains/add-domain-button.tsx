import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';

export function AddDomainButton( { siteSlug }: { siteSlug?: string } ) {
	const onSearchClick = () => {
		window.location.href = siteSlug
			? addQueryArgs( '/setup/domain', { siteSlug } )
			: '/setup/domain';
		return false;
	};

	const onTransferClick = () => {
		window.location.href = siteSlug
			? addQueryArgs( '/setup/domain/use-my-domain', { siteSlug } )
			: '/setup/domain-transfer';
		return false;
	};

	return (
		<Dropdown
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ isOpen ? chevronUp : chevronDown }
					iconPosition="right"
					variant="primary"
					__next40pxDefaultSize
					onClick={ onToggle }
					aria-expanded={ isOpen }
				>
					{ __( 'Add domain name' ) }
				</Button>
			) }
			renderContent={ () => (
				<>
					<MenuItem iconPosition="left" icon={ search } onClick={ onSearchClick }>
						{ __( 'Search domain names' ) }
					</MenuItem>
					<MenuItem iconPosition="left" icon={ globe } onClick={ onTransferClick }>
						{ siteSlug ? __( 'Use a domain name I own' ) : __( 'Transfer domain name' ) }
					</MenuItem>
				</>
			) }
		/>
	);
}
