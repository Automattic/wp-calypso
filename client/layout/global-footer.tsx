import { isEnabled } from '@automattic/calypso-config';
import { removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { UniversalNavbarFooter, type FooterProps } from '@automattic/wpcom-template-parts';
import { __ } from '@wordpress/i18n';
import cookie from 'cookie';
import { useEffect, useState } from 'react';
import DoNotSellDialogContainer from 'calypso/blocks/do-not-sell-dialog';
import { refreshCountryCodeCookieGdpr, useDoNotSell } from 'calypso/lib/analytics/utils';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import type { AppState } from 'calypso/types';

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

// Pages that end on a dark section, so the 2026 footer continues it; all others stay white.
const DARK_FOOTER_ROUTES = [ '/themes', '/patterns', '/speed-test-tool/weekly-report' ];

const isDarkFooterPage = ( state: AppState ) => {
	const route = removeLocaleFromPathLocaleInFront( getCurrentRoute( state ) ?? '' );

	// Only the plugins home ends on the dark FAQ; search results, categories and plugin pages don't.
	if ( route === '/plugins' ) {
		return ! getCurrentQueryArguments( state )?.s;
	}
	// Only the v2 profiler is dark, and it's off in production.
	if ( route.startsWith( '/site-profiler' ) ) {
		return isEnabled( 'site-profiler/metrics' );
	}
	return (
		DARK_FOOTER_ROUTES.some( ( prefix ) => route.startsWith( prefix ) ) &&
		! route.startsWith( '/patterns/site-layouts/' )
	);
};

export function GlobalFooter( props: FooterProps ) {
	const isDarkEnding = useSelector( isDarkFooterPage );

	return props.colorway ? (
		<Footer2026Privacy
			{ ...props }
			colorway={ props.colorway === 'white' && isDarkEnding ? 'dark' : props.colorway }
		/>
	) : (
		<UniversalNavbarFooter { ...props } />
	);
}
