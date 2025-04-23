import { __experimentalInputControl as InputControl, Button } from '@wordpress/components';
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
		info: {
			control: {
				type: 'color',
			},
		},
		success: {
			control: {
				type: 'color',
			},
		},
		warning: {
			control: {
				type: 'color',
			},
		},
		error: {
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

type ExtraStorybookControls = React.ComponentProps< typeof Theme >[ 'color' ];

type Story = StoryObj< React.ComponentProps< typeof Theme > & ExtraStorybookControls >;

export const Default: Story = {
	render: ( args ) => (
		<Theme
			color={ {
				primary: args.primary,
				info: args.info,
				success: args.success,
				warning: args.warning,
				error: args.error,
				fun: args.fun,
				scheme: args.scheme,
			} }
		>
			{ args.children }
		</Theme>
	),
	args: {
		primary: '#F76B15',
		fun: 10,
		scheme: 'light',
		children: (
			<>
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
					].map( ( { colSpan, label } ) => (
						<div
							key={ label }
							style={ {
								textAlign: 'center',
								marginInline: '4px',
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
					{ [
						'primary-scale',
						'neutral-scale',
						'info-scale',
						'success-scale',
						'warning-scale',
						'error-scale',
					].map( ( scaleName, i ) => [
						<div
							key={ `${ scaleName }-label-${ i }` }
							style={ {
								fontSize: '0.875rem',
								display: 'flex',
								alignItems: 'center',
							} }
						>
							{ scaleName }
						</div>,
						...Array( 12 )
							.fill( '' )
							.map( ( _, i ) => (
								<div
									key={ `${ scaleName }-color-${ i }` }
									style={ {
										aspectRatio: '2',
										backgroundColor: `var(--theme-color-${ scaleName }-${ i + 1 })`,
									} }
								/>
							) ),
					] ) }
				</div>
				<div
					className="demo-container"
					style={ {
						width: '100%',
						marginTop: '1rem',
						background: 'var(--theme-color-background)',
					} }
				>
					<style>{ `
						.demo-container {
							--wp-components-color-gray-100: var(--theme-color-neutral-scale-1);
							--wp-components-color-gray-200: var(--theme-color-neutral-scale-3);
							--wp-components-color-gray-300: var(--theme-color-neutral-scale-6);
							--wp-components-color-gray-400: var(--theme-color-neutral-scale-7);
							--wp-components-color-gray-500: var(--theme-color-neutral-scale-8);
							--wp-components-color-gray-600: var(--theme-color-neutral-scale-9);
							--wp-components-color-gray-700: var(--theme-color-neutral-scale-10);
							--wp-components-color-gray-800: var(--theme-color-neutral-scale-11);
							--wp-components-color-gray-900: var(--theme-color-neutral-scale-12);


						  	--wp-components-color-accent: var(--theme-color-primary-scale-9);
							--wp-components-color-accent-darker-10: var(--theme-color-primary-scale-10);
							--wp-components-color-accent-darker-20: var(--theme-color-primary-scale-10)
							--wp-components-color-accent-inverted: var(--theme-color-primary-contrast-small);

							--wp-components-color-background: var(--theme-color-background);
							--wp-components-color-foreground: var(--theme-color-neutral-scale-12);
							--wp-components-color-foreground-inverted: var(--theme-color-neutral-scale-1);
						}
					` }</style>
					<Button __next40pxDefaultSize variant="primary">
						Click me
					</Button>
					<div>
						<InputControl className="demo-input" label="Value" placeholder="Placeholder" />
					</div>
				</div>
			</>
		),
	},
};
