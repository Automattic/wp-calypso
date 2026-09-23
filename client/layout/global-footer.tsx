import { UniversalNavbarFooter, type FooterProps } from '@automattic/wpcom-template-parts';
import { __ } from '@wordpress/i18n';
import cookie from 'cookie';
import { useEffect, useState } from 'react';
import DoNotSellDialogContainer from 'calypso/blocks/do-not-sell-dialog';
import { refreshCountryCodeCookieGdpr, useDoNotSell } from 'calypso/lib/analytics/utils';

const Footer2026Privacy = ( props: FooterProps ) => {
	const { shouldSeeDoNotSell, isDoNotSell, onSetDoNotSell } = useDoNotSell();
	const [ showCaliforniaNotice, setShowCaliforniaNotice ] = useState( false );
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	useEffect( () => {
		let active = true;
		refreshCountryCodeCookieGdpr()
			.then( () => {
				const { country_code: country, region } = cookie.parse( document.cookie );
				if ( active ) {
					setShowCaliforniaNotice( country === 'US' && region?.toLowerCase() === 'california' );
				}
			} )
			.catch( () => {} );
		return () => {
			active = false;
		};
	}, [] );

	return (
		<>
			<UniversalNavbarFooter
				{ ...props }
				showCaliforniaNotice={ showCaliforniaNotice }
				additionalCompanyLinks={
					shouldSeeDoNotSell ? (
						<button
							type="button"
							onClick={ ( event ) => {
								event.preventDefault();
								setIsDialogOpen( true );
							} }
						>
							{ __( 'Do not sell or share my personal information' ) }
						</button>
					) : null
				}
			/>
			{ isDialogOpen && (
				<DoNotSellDialogContainer
					isOpen
					onClose={ () => setIsDialogOpen( false ) }
					onToggleActive={ onSetDoNotSell }
					isActive={ isDoNotSell }
				/>
			) }
		</>
	);
};

export function GlobalFooter( props: FooterProps ) {
	return props.colorway ? (
		<Footer2026Privacy { ...props } />
	) : (
		<UniversalNavbarFooter { ...props } />
	);
}
