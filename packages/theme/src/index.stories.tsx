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
		scheme: {
			control: 'radio',
			options: [ 'light', 'dark' ],
			defaultValue: 'light',
		},
	},
};

export default meta;

type StoryArgs = {
	primary: string;
	fun: number;
	scheme: 'light' | 'dark';
	children?: React.ReactNode;
};

type Story = StoryObj< typeof Theme > & {
	args: StoryArgs;
};

export const Default: Story = {
	render: ( args ) => (
		// @ts-expect-error Custom control types
		<Theme color={ { primary: args.primary, fun: args.fun, scheme: args.scheme } }>
			{ args.children }
		</Theme>
	),
	args: {
		primary: '#f00',
		fun: 0,
		scheme: 'light',
		children: (
			<div
				style={ {
					display: 'grid',
					gridTemplateColumns: 'auto repeat(12, minmax(2rem, 1fr))',
					gap: '4px',
				} }
			>
				<div /> { /* Empty cell for top-left corner */ }
				{ Array( 12 )
					.fill( '' )
					.map( ( _, i ) => (
						<div
							key={ i }
							style={ {
								textAlign: 'center',
								padding: '0.5rem',
							} }
						>
							{ i + 1 }
						</div>
					) ) }
				{ [ 'neutral-scale', 'primary-scale' ].map( ( scaleName ) =>
					[
						{ name: 'Radix', varPrefix: '--theme-color-radix-' },
						{ name: 'A8C', varPrefix: '--theme-color-a8c-' },
					]
						.map( ( { name, varPrefix } ) => [
							<div
								key={ `${ name }-${ scaleName }-label` }
								style={ {
									fontSize: '0.875rem',
									display: 'flex',
									alignItems: 'center',
								} }
							>
								{ name } { scaleName }
							</div>,
							...Array( 12 )
								.fill( '' )
								.map( ( _, i ) => (
									<div
										key={ `${ name }-${ scaleName }-color-${ i }` }
										style={ {
											aspectRatio: '2',
											backgroundColor: `var(${ varPrefix }${ scaleName }-${ i })`,
										} }
									/>
								) ),
						] )
						.flat()
				) }
			</div>
		),
	},
};
