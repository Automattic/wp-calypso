import { isEnabled } from '@automattic/calypso-config';
import { Global, css } from '@emotion/react';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	let navRedesignV2GlobalStyles;
	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		navRedesignV2GlobalStyles = css`
			html {
				overflow-y: auto;
			}
			body.is-reader-page,
			.is-reader-page .layout,
			.layout.is-section-reader,
			.layout.is-section-reader .layout__content,
			.is-section-reader {
				background: initial;
			}
			body.is-section-reader {
				background: var( --studio-gray-0 );

				&.rtl .layout__content {
					padding: 16px calc( var( --sidebar-width-max ) ) 16px 16px;
				}

				.layout__content {
					// Add border around everything
					overflow: hidden;
					min-height: 100vh;
					@media only screen and ( min-width: 782px ) {
						padding: 16px 16px 16px calc( var( --sidebar-width-max ) ) !important;
					}
					.layout_primary > div {
						padding-bottom: 0;
					}
				}

				.layout__secondary .global-sidebar {
					border: none;
				}

				.has-no-masterbar .layout__content .main {
					padding-top: 16px;
				}

				div.layout.is-global-sidebar-visible {
					.main {
						@media only screen and ( min-width: 600px ) and ( max-width: 960px ) {
							padding: 24px;
						}
						@media only screen and ( max-width: 660px ) {
							padding-top: 0;
						}
						border-block-end: 1px solid var( --studio-gray-0 );
					}
					.layout__primary > div {
						background: var( --color-surface );
						border-radius: 8px;
						box-shadow: none;
						@media only screen and ( min-width: 600px ) {
							height: calc( 100vh - var( --masterbar-height ) - 50px );
						}
						@media only screen and ( min-width: 782px ) {
							height: calc( 100vh - 32px );
						}
						overflow: hidden;
					}
					.layout__primary > div > div {
						height: 100%;
						overflow-y: auto;
						overflow-x: hidden;
					}
				}

				@media only screen and ( max-width: 600px ) {
					.navigation-header__main {
						justify-content: normal;
						align-items: center;
						.formatted-header {
							flex: none;
						}
					}
				}

				@media only screen and ( max-width: 781px ) {
					div.layout.is-global-sidebar-visible {
						.layout__primary {
							overflow-x: auto;
						}
					}
					.layout__primary > div {
						background: var( --color-surface );
						margin: 0;
						border-radius: 8px;
						height: calc( 100vh - 32px );
					}
					header.navigation-header {
						padding-inline: 16px;
						padding-bottom: 0;
					}
				}
			}
		`;
	}
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			<Global styles={ navRedesignV2GlobalStyles } />
			<Stream
				{ ...props }
				className="following"
				streamSidebar={ () => <ReaderListFollowedSites path={ window.location.pathname } /> }
			>
				<BloganuaryHeader />
				<NavigationHeader
					title={ translate( 'Recent' ) }
					subtitle={ translate( "Stay current with the blogs you've subscribed to." ) }
					className={ clsx( 'following-stream-header', {
						'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
					} ) }
				/>
				<FollowingIntro />
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
