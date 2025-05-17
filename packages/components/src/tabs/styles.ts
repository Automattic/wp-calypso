/**
 * External dependencies
 */
import styled from '@emotion/styled';
import * as Ariakit from '@ariakit/react';

/**
 * Internal dependencies
 */
import { COLORS, CONFIG } from '../utils';
import { space } from '../utils/space';
import Icon from '../icon';

export const StyledTabList = styled( Ariakit.TabList )`
	display: flex;
	align-items: stretch;
	overflow-x: auto;

	&[aria-orientation='vertical'] {
		flex-direction: column;
	}

	:where( [aria-orientation='horizontal'] ) {
		width: fit-content;
	}

	--direction-factor: 1;
	--direction-start: left;
	--direction-end: right;
	--selected-start: var( --selected-left, 0 );
	&:dir( rtl ) {
		--direction-factor: -1;
		--direction-start: right;
		--direction-end: left;
		--selected-start: var( --selected-right, 0 );
	}

	@media not ( prefers-reduced-motion ) {
		&[data-indicator-animated]::before {
			transition-property: transform, border-radius, border-block;
			transition-duration: 0.2s;
			transition-timing-function: ease-out;
		}
	}
	position: relative;
	&::before {
		content: '';
		position: absolute;
		pointer-events: none;
		transform-origin: var( --direction-start ) top;

		// Windows high contrast mode.
		outline: 2px solid transparent;
		outline-offset: -1px;
	}

	/* Using a large value to avoid antialiasing rounding issues
			when scaling in the transform, see: https://stackoverflow.com/a/52159123 */
	--antialiasing-factor: 100;
	&[aria-orientation='horizontal'] {
		--fade-width: 4rem;
		--fade-gradient-base: transparent 0%, black var( --fade-width );
		--fade-gradient-composed: var( --fade-gradient-base ), black 60%,
			transparent 50%;
		&.is-overflowing-first {
			mask-image: linear-gradient(
				to var( --direction-end ),
				var( --fade-gradient-base )
			);
		}
		&.is-overflowing-last {
			mask-image: linear-gradient(
				to var( --direction-start ),
				var( --fade-gradient-base )
			);
		}
		&.is-overflowing-first.is-overflowing-last {
			mask-image: linear-gradient(
					to right,
					var( --fade-gradient-composed )
				),
				linear-gradient( to left, var( --fade-gradient-composed ) );
		}

		&::before {
			bottom: 0;
			height: 0;
			width: calc( var( --antialiasing-factor ) * 1px );
			transform: translateX(
					calc(
						var( --selected-start ) * var( --direction-factor ) *
							1px
					)
				)
				scaleX(
					calc(
						var( --selected-width, 0 ) /
							var( --antialiasing-factor )
					)
				);
			border-bottom: var( --wp-admin-border-width-focus ) solid
				${ COLORS.theme.accent };
		}
	}
	&[aria-orientation='vertical'] {
		&::before {
			/* Adjusting the border radius to match the scaling in the y axis. */
			border-radius: ${ CONFIG.radiusSmall } /
				calc(
					${ CONFIG.radiusSmall } /
						(
							var( --selected-height, 0 ) /
								var( --antialiasing-factor )
						)
				);
			top: 0;
			left: 0;
			width: 100%;
			height: calc( var( --antialiasing-factor ) * 1px );
			transform: translateY( calc( var( --selected-top, 0 ) * 1px ) )
				scaleY(
					calc(
						var( --selected-height, 0 ) /
							var( --antialiasing-factor )
					)
				);
			background-color: color-mix(
				in srgb,
				${ COLORS.theme.accent },
				transparent 96%
			);
		}
		&[data-select-on-move='true']:has(
				:is( :focus-visible, [data-focus-visible] )
			)::before {
			box-sizing: border-box;
			border: var( --wp-admin-border-width-focus ) solid
				${ COLORS.theme.accent };
			/* Adjusting the border width to match the scaling in the y axis. */
			border-block-width: calc(
				var( --wp-admin-border-width-focus, 1px ) /
					(
						var( --selected-height, 0 ) /
							var( --antialiasing-factor )
					)
			);
		}
	}
`;

export const Tab = styled( Ariakit.Tab )`
	& {
		/* Resets */
		border-radius: 0;
		background: transparent;
		border: none;
		box-shadow: none;

		flex: 1 0 auto;
		white-space: nowrap;
		display: flex;
		align-items: center;
		cursor: pointer;
		line-height: 1.2; // Characters in some languages (e.g. Japanese) may have a native higher line-height.
		font-weight: 400;
		color: ${ COLORS.theme.foreground };

		&[aria-disabled='true'] {
			cursor: default;
			color: ${ COLORS.ui.textDisabled };
		}

		&:not( [aria-disabled='true'] ):is( :hover, [data-focus-visible] ) {
			color: ${ COLORS.theme.accent };
		}

		&:focus:not( :disabled ) {
			box-shadow: none;
			outline: none;
		}

		// Focus indicator.
		position: relative;
		&::after {
			position: absolute;
			pointer-events: none;

			// Draw the indicator.
			// Outline works for Windows high contrast mode as well.
			outline: var( --wp-admin-border-width-focus ) solid
				${ COLORS.theme.accent };
			border-radius: ${ CONFIG.radiusSmall };

			// Animation
			opacity: 0;

			@media not ( prefers-reduced-motion ) {
				transition: opacity 0.1s linear;
			}
		}

		&[data-focus-visible]::after {
			opacity: 1;
		}
	}

	[aria-orientation='horizontal'] & {
		padding-inline: ${ space( 4 ) };
		height: ${ space( 12 ) };
		scroll-margin: 24px;

		&::after {
			content: '';
			inset: ${ space( 3 ) };
		}
	}

	[aria-orientation='vertical'] & {
		padding: ${ space( 2 ) } ${ space( 3 ) };
		min-height: ${ space( 10 ) };

		&[aria-selected='true'] {
			color: ${ COLORS.theme.accent };
			fill: currentColor;
		}
	}
	[aria-orientation='vertical'][data-select-on-move='false'] &::after {
		content: '';
		inset: var( --wp-admin-border-width-focus );
	}
`;

export const TabChildren = styled.span`
	flex-grow: 1;

	display: flex;
	align-items: center;

	[aria-orientation='horizontal'] & {
		justify-content: center;
	}
	[aria-orientation='vertical'] & {
		justify-content: start;
	}
`;

export const TabChevron = styled( Icon )`
	flex-shrink: 0;
	margin-inline-end: ${ space( -1 ) };
	[aria-orientation='horizontal'] & {
		display: none;
	}
	opacity: 0;
	[role='tab']:is( [aria-selected='true'], [data-focus-visible], :hover ) & {
		opacity: 1;
	}
	// The chevron is transitioned into existence when selectOnMove is enabled,
	// because otherwise it looks jarring, as it shows up outside of the focus
	// indicator that's being animated at the same time.
	@media not ( prefers-reduced-motion ) {
		[data-select-on-move='true']
			[role='tab']:is( [aria-selected='true'],  )
			& {
			transition: opacity 0.15s 0.15s linear;
		}
	}
	&:dir( rtl ) {
		rotate: 180deg;
	}
`;

export const TabPanel = styled( Ariakit.TabPanel )`
	&:focus {
		box-shadow: none;
		outline: none;
	}

	&[data-focus-visible] {
		box-shadow: 0 0 0 var( --wp-admin-border-width-focus )
			${ COLORS.theme.accent };
		// Windows high contrast mode.
		outline: 2px solid transparent;
		outline-offset: 0;
	}
`;
