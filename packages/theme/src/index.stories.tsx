import { Theme } from './';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof Theme > = {
	title: 'Theme/Theme',
	component: Theme,
	argTypes: {
		children: {
			table: {
				disable: true,
			},
		},
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

type ExtraStorybookControls = {
	primary: string;
	fun: number;
	scheme: 'light' | 'dark';
};

type Story = StoryObj< React.ComponentProps< typeof Theme > & ExtraStorybookControls >;

export const Default: Story = {
	render: ( args ) => (
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
				{ /* Index numbers */ }
				<div /> { /* Empty cell for top-left corner */ }
				{ [
					{ colSpan: 2, label: 'Backgrounds' },
					{ colSpan: 3, label: 'Interactive components' },
					{ colSpan: 3, label: 'Borders and separators' },
					{ colSpan: 2, label: 'Solid colors' },
					{ colSpan: 2, label: 'Accessible text' },
				].map( ( { colSpan, label }, i ) => (
					<div
						key={ label }
						style={ {
							textAlign: 'center',
							padding: '0.5rem',
							fontSize: '0.875rem',
							gridColumnEnd: `span ${ colSpan }`,
							borderBottom: '1px solid #ccc',
						} }
					>
						{ label }
					</div>
				) ) }
				{ /* Index numbers */ }
				<div /> { /* Empty cell for top-left corner */ }
				{ Array( 12 )
					.fill( '' )
					.map( ( _, i ) => (
						<div
							key={ `scale-index-${ i }` }
							style={ {
								textAlign: 'center',
								padding: '0.5rem',
							} }
						>
							{ i + 1 }
						</div>
					) ) }
				{ /* Scales */ }
				{ [ 'neutral-scale', 'primary-scale' ].map( ( scaleName ) => (
					<>
						<div
							key={ `${ scaleName }-label` }
							style={ {
								fontSize: '0.875rem',
								display: 'flex',
								alignItems: 'center',
							} }
						>
							{ scaleName }
						</div>
						{ Array( 12 )
							.fill( '' )
							.map( ( _, i ) => (
								<div
									key={ `${ scaleName }-color-${ i }` }
									style={ {
										aspectRatio: '2',
										backgroundColor: `var(--theme-color-${ scaleName }-${ i })`,
									} }
								/>
							) ) }
					</>
				) ) }
			</div>
		),
	},
};
