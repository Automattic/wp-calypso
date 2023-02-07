/**
 * - section styles borrowed from /my-sites/stats, adapted to modernize the header and navbar.
 * - .navigation styles borrowed from /blocks/stats-navigation, adapted to modernize the plans navigation component.
 *  This is a temporary solution until we can use a Layout component.
 */

import { css, Global } from '@emotion/react';
import { memo } from '@wordpress/element';

const ModernizedLayout: React.FunctionComponent< { dropShadowOnHeader?: boolean } > = ( {
	dropShadowOnHeader = true,
} ) => {
	const backgroundColor = '#fdfdfd';
	const sectionMaxWidth = '1224px';
	const layoutContentPaddingTop = '79px';
	const sidebarAppearanceBreakPoint = '783px';
	// from @automattic/components/src/highlight-cards/variables.scss:
	const customMobileBreakpoint = '660px';
	const verticalMargin = '32px';

	const globalOverrides = css`
		.plans__section-header,
		.current-plan__section-header {
			background-color: var( --studio-white );
			${ dropShadowOnHeader &&
			css`
				box-shadow: inset 0 -1px 0 #0000000d;
			` }

			@media ( min-width: ${ customMobileBreakpoint } ) {
				padding: 0 max( calc( 50% - ( ${ sectionMaxWidth } / 2 ) ), 32px );
			}
		}

		// Main layout content
		.plans,
		.current-plan {
			// Ensures horizontal padding for all sections.
			@media ( min-width: ${ customMobileBreakpoint } ) {
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

					@include breakpoint-deprecated( '>480px' ) {
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

					@media ( max-width: $break-medium ) {
						padding: 0 16px;
					}
				}

				.section-nav-tab {
					&:not( :first-child ) {
						margin-left: 16px;

						@media ( max-width: $break-mobile ) {
							margin-left: 0;
						}
					}

					.section-nav-tab__link {
						padding: 8px 12px;
						font-size: $font-body-small;
						line-height: 20px;

						&:hover {
							color: var( --color-neutral-60 );
							background-color: var( --color-surface );
						}

						@media ( max-width: $break-medium ) {
							padding: 8px 0;
						}

						@media ( max-width: $break-mobile ) {
							padding: 8px;
						}
					}

					@include breakpoint-deprecated( '>480px' ) {
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

			// this overrides the default .layout__content that adds unwanted padding
			& .layout__content,
			&.theme-default .focus-content .layout__content {
				padding: ${ layoutContentPaddingTop } 0 0 0;

				@media ( min-width: ${ sidebarAppearanceBreakPoint } ) {
					padding: ${ layoutContentPaddingTop } 0 0 calc( var( --sidebar-width-max ) + 1px );
				}

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
