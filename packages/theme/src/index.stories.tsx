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
										backgroundColor: `var(--theme-color-${ scaleName }-${ i })`,
									} }
								/>
							) ),
					] ) }
				</div>
				<div
					style={ {
						width: '100%',
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '4px',
						marginTop: '1rem',
					} }
				>
					<div
						style={ {
							aspectRatio: '2',
							backgroundColor: 'var(--theme-color-primary-scale-8)',
							color: 'var(--theme-color-primary-contrast-small)',
							fontSize: '16px',
							display: 'grid',
							placeItems: 'center',
						} }
					>
						Some small text
					</div>
					<div
						style={ {
							aspectRatio: '2',
							backgroundColor: 'var(--theme-color-primary-scale-8)',
							color: 'var(--theme-color-primary-contrast-large)',
							fontSize: '24px',
							display: 'grid',
							placeItems: 'center',
						} }
					>
						Some large text
					</div>
				</div>
			</>
		),
	},
};
