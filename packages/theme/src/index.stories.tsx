import { Theme } from './';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof Theme > = {
	title: 'Theme/Theme',
	component: Theme,
	argTypes: {
		color: {
			table: {
				disable: true,
			},
		},
		// @ts-expect-error Custom control types
		primary: {
			control: {
				type: 'color',
			},
		},
		fun: {
			control: { type: 'range', min: 0, max: 100, step: 1 },
		},
	},
};

export default meta;

type Story = StoryObj< typeof Theme >;

export const Default: Story = {
	render: ( args ) => (
		<Theme { ...args } color={ { primary: args.primary, fun: args.fun } }>
			{ args.children }
		</Theme>
	),
	args: {
		primary: '#f00',
		fun: 0,
		children: (
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					gap: '2px',
				} }
			>
				{ [ 'neutral-scale', 'primary-scale' ].map( ( name ) => (
					<div key={ name } style={ { display: 'flex', gap: 'inherit' } }>
						{ Array( 12 )
							.fill( '' )
							.map( ( _, i ) => (
								<div
									key={ i }
									style={ {
										width: '3rem',
										aspectRatio: '1',
										backgroundColor: `var(--a8c-theme-color-${ name }-${ i })`,
										border: '1px solid var(--a8c-theme-border-default)',
									} }
								/>
							) ) }
					</div>
				) ) }
			</div>
		),
	},
};
