import { Button, Dropdown, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search, globe, chevronUp, chevronDown } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';

export function AddDomainButton( { siteSlug }: { siteSlug?: string } ) {
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
					<MenuItem
						href={
							siteSlug
								? addQueryArgs( '/setup/domain', {
										siteSlug,
								  } )
								: '/start/domain'
						}
						iconPosition="left"
						icon={ search }
					>
						{ __( 'Search domain names' ) }
					</MenuItem>
					<MenuItem
						href={
							siteSlug
								? addQueryArgs( '/setup/domain/use-my-domain', { siteSlug } )
								: '/setup/domain-transfer'
						}
						iconPosition="left"
						icon={ globe }
					>
						{ siteSlug ? __( 'Use a domain name I own' ) : __( 'Transfer domain names' ) }
					</MenuItem>
				</>
			) }
		/>
	);
}
