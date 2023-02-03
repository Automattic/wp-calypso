/**
 * Styles borrowed from /stats, adapted to modernize the header and navbar.
 * This is a temporary solution until we can use a Layout component.
 */

import { css, Global } from '@emotion/react';

const backgroundColor = '#fdfdfd';
const sectionMaxWidth = '1224px';
const layoutContentPaddingTop = '79px';
const sidebarAppearanceBreakPoint = '783px';
// from @automattic/components/src/highlight-cards/variables.scss:
const customMobileBreakpoint = '660px';
const verticalMargin = '32px';

const ModernizedLayout: React.FunctionComponent< { section: string; main: string } > = ( {
	section,
	main,
} ) => {
	const globalOverrides = css`
		.${ main }__section-header {
			background-color: var( --studio-white );

			@media ( min-width: ${ customMobileBreakpoint } ) {
				padding: 0 max( calc( 50% - ( ${ sectionMaxWidth } / 2 ) ), 32px );
			}
		}

		// Main layout content
		.${ main } {
			// Ensures horizontal padding for all sections.
			@media ( min-width: ${ customMobileBreakpoint } ) {
				> * {
					padding: 0 max( calc( 50% - ( ${ sectionMaxWidth } / 2 ) ), 32px );
				}
			}

			&.has-fixed-nav {
				padding-top: 44px;
			}
		}

		.is-section-${ section } {
			background-color: var( --studio-white );

			.${ main } {
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

export default ModernizedLayout;
