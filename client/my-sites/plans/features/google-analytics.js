/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import page from 'page';

export default function( context ) {
	const svgLogo = '<svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><title>icon - google analytics</title><g fill="none" fill-rule="evenodd"><rect fill-opacity=".27" fill="#C8D7E1" x="4" y="4" width="80" height="80" rx="6"/><rect fill="#FFF" width="80" height="80" rx="6"/><path d="M45.16 49.896a8 8 0 1 1-14.137 4.477l-11.036-6.117A7.966 7.966 0 0 1 15 50c-.57 0-1.124-.06-1.66-.172L0 62.71v11.293A5.997 5.997 0 0 0 5.997 80h68.006A5.997 5.997 0 0 0 80 74.003V33.75l-12.512-8.127A7.963 7.963 0 0 1 63 27c-.76 0-1.495-.106-2.19-.304l-15.65 23.2z" stroke="#F05824" stroke-width="2" fill-opacity=".62" fill="#F05824"/><path d="M39.847 47.044A7.97 7.97 0 0 0 33.707 49l-10.773-5.97A8 8 0 1 0 8.292 46.36L0 54.37V5.996A5.997 5.997 0 0 1 5.997 0h68.006A5.997 5.997 0 0 1 80 5.997v20.597l-9.168-5.954a8 8 0 1 0-14.764 2.356l-16.22 24.048z" stroke="#F79A1F" stroke-width="2" fill-opacity=".68" fill="#F79A1F"/></g></svg>';

	const svgIllustration = '<svg width="720" height="168" viewBox="0 0 720 168" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>figure</title><defs><path id="a" d="M0 0h720v168H0z"/><path id="c" d="M3.958 95.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06L580.333.87l64.178 18.397 63.95 52.7 64.12 23.122v50.48H.48"/></defs><g fill="none" fill-rule="evenodd"><mask id="b" fill="#fff"><use xlink:href="#a"/></mask><use xlink:href="#a"/><g mask="url(#b)"><g transform="translate(-24 -22)"><g transform="translate(0 61)"><mask id="d" fill="#fff"><use xlink:href="#c"/></mask><use xlink:href="#c"/><g mask="url(#d)" fill-opacity=".05" fill="#44B963"><path d="M20 98h31v39H20zM84-31h31v177H84zM142-31h31v177h-31zM200-31h31v177h-31zM258-31h31v177h-31zM316-31h31v177h-31zM374-31h31v177h-31zM432-31h31v177h-31zM490-31h31v177h-31zM548-31h31v177h-31zM606-31h31v177h-31zM664-31h31v177h-31zM724-31h31v177h-31z"/></g></g><path d="M4.958 159.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06 64.15-45.218 64.178 18.397 63.95 52.7 64.12 23.122" stroke-opacity=".12" stroke="#44B963" stroke-width="4"/><path d="M3.958 156.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06 64.15-45.218 64.178 18.397 63.95 52.7 64.12 23.122v50.48H.48" stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill-opacity=".05" fill="#44B963"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="68" cy="167" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="132" cy="137" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="196" cy="152" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="259" cy="107" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="324" cy="80" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="388" cy="93" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="452" cy="128" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="516" cy="107" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="580" cy="62" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="644" cy="80" r="4"/><circle stroke-opacity=".62" stroke="#44B963" stroke-width="2" fill="#FFF" cx="708" cy="133" r="4"/></g><path d="M541 6.005c0-1.107.888-2.005 2-2.005h35c1.104 0 2 .897 2 2.005v19.99A1.997 1.997 0 0 1 578 28h-13.657l-4.053 3-4.018-3h-13.275A2 2 0 0 1 541 25.995V6.005z" fill-opacity=".27" fill="#C8D7E1"/><path d="M537 2.005C537 .898 537.888 0 539 0h35c1.104 0 2 .897 2 2.005v19.99A1.997 1.997 0 0 1 574 24h-13.657l-4.053 3-4.018-3h-13.275A2 2 0 0 1 537 21.995V2.005z" stroke="#C8D7E1" fill="#FFF"/><text font-family="AppleColorEmoji, Apple Color Emoji" font-size="14" fill="#000" transform="translate(537)"><tspan x="12" y="17">🎉</tspan></text></g></g></svg>';

	function goBack() {
		page.back( '/plans/' + ( context.params.domain || '' ) );
	}

	renderWithReduxStore(
		<Main>
			<HeaderCake onClick={ goBack }>Google Analytics</HeaderCake>
			<Card compact>
				<div className="feature-analytics__logo" dangerouslySetInnerHTML={{ __html: svgLogo }} />
				<h1 className="feature-analytics__title">Use Google Analytics with Business</h1>
				<span className="feature-analytics__description">
					Upgrade to Business to use your own Google Analytics, get a custom domain, and much more.
				</span>
				<div className="feature-analytics__ilustration" dangerouslySetInnerHTML={{ __html: svgIllustration }} />
			</Card>
			<Card compact>
			</Card>
		</Main>,
		document.getElementById( 'primary' ),
		context.store
	);
}
