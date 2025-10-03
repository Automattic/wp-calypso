/**
 * - section styles borrowed from /my-sites/stats, adapted to modernize the header and navbar.
 * - .navigation styles borrowed from /blocks/stats-navigation, adapted to modernize the plans navigation component.
 *  This is a temporary solution until we can use a Layout component.
 */

import { css, Global } from '@emotion/react';
import { memo } from '@wordpress/element';
import './modernized-layout.scss';

const ModernizedLayout: React.FunctionComponent = () => {
	const backgroundColor = '#fdfdfd';
	const sectionMaxWidth = '1224px';
	const breakMedium = '782px';
	const breakMobile = '480px';
	// ----------------------------------------------
	// from calypso/my-sites/stats/components/highlight-cards/variables.scss:
	// ----------------------------------------------
	// If changed, also change @plans-section-custom-mobile-breakpoint in client/my-sites/plans-features-main/_media-queries.scss
	const customBreakpointSmall = '780px';
	const verticalMargin = '32px';
	// ----------------------------------------------

	const globalOverrides = css`
		.navigation-header.plans__section-header {
			@media ( min-width: ${ customBreakpointSmall } ) {
				padding: 0 max( calc( 50% - ( ${ sectionMaxWidth } / 2 ) ), 32px ) 24px;
			}
		}

		// Main layout content
		.plans,
		.current-plan {
			// Ensures horizontal padding for all sections.
			@media ( min-width: ${ customBreakpointSmall } ) {
				> * {
					padding: 0 max( calc( 50% - ( ${ sectionMaxWidth } / 2 ) ), 32px );
				}
			}

			&.has-fixed-nav {
				padding-top: 44px;
			}

			.navigation {
				box-shadow: inset 0 -1px 0 #0000000d;
				background-color: var( --studio-white );

				.segmented-control {
					margin-left: 0;

					@media ( min-width: ${ breakMedium } ) {
						margin-left: 16px;
					}
				}

				.section-nav {
					margin: 0;
					box-shadow: inset 0 -1px 0 #0000000d;
				}

				.section-nav-group__label {
					padding: 0;
				}

				.section-nav__panel {
					padding: 0;

					@media ( max-width: ${ breakMedium } ) {
						padding: 0 16px;
					}
				}

				.section-nav-tab {
					&:not( :first-of-type ) {
						margin-left: 16px;

						@media ( max-width: ${ breakMobile } ) {
							margin-left: 0;
						}
					}

					.section-nav-tab__link {
						padding: 8px 12px;
						font-size: var( --scss-font-body-small );
						line-height: 20px;

						&:hover {
							color: var( --color-neutral-60 );
							background-color: var( --color-surface );
						}

						@media ( max-width: ${ breakMedium } ) {
							padding: 8px 0;
						}

						@media ( max-width: ${ breakMobile } ) {
							padding: 8px;
						}
					}

					@media ( min-width: ${ breakMobile } ) {
						.section-nav-tab__link {
							color: var( --color-neutral-60 );
						}
						&.is-selected {
							border-bottom-color: var( --color-neutral-100 );

							.section-nav-tab__link {
								color: var( --color-neutral-100 );
							}
						}
					}
				}
			}
		}

		.is-section-plans {
			background-color: var( --studio-white );

			.plans,
			.current-plan {
				background-color: ${ backgroundColor };
			}

			&.theme-default .focus-content .layout__content {
				.jetpack-colophon {
					padding-top: ${ verticalMargin };
					padding-bottom: ${ verticalMargin };
					margin-top: 0;
				}
			}
		}
	`;

	return <Global styles={ globalOverrides } />;
};

export default memo( ModernizedLayout );
