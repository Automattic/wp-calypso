import { JetpackLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackLogo.Default > = {
	title: 'Unaudited/Logos/JetpackLogo',
	component: JetpackLogo.Default,
	argTypes: {
		'aria-hidden': {
			control: 'boolean',
		},
	},
};
export default meta;

type Story = StoryObj< typeof JetpackLogo.Default >;

export const Default: Story = {
	render: ( args ) => (
		<div style={ { display: 'grid', gridTemplateColumns: 'min-content 1fr 1fr' } }>
			<div />
			<div style={ { display: 'flex', justifyContent: 'center', padding: '1rem' } }>
				<code>Simulated light theme</code>
			</div>
			<div style={ { display: 'flex', justifyContent: 'center', padding: '1rem' } }>
				<code>Simulated dark theme</code>
			</div>
			{ [ JetpackLogo.Default, JetpackLogo.Mark ].map( ( Logo ) => (
				<>
					<div style={ { display: 'flex', alignItems: 'center' } }>
						<code>{ Logo.displayName }</code>
					</div>
					{ [ 'light', 'dark' ].map( ( theme ) => (
						<div
							key={ `${ Logo.displayName }-${ theme }` }
							style={ {
								display: 'grid',
								placeItems: 'center',
								padding: '1rem',
								background: theme === 'light' ? '#fff' : '#000',
								color: theme === 'light' ? '#1e1e1e' : '#fff',
							} }
						>
							<Logo { ...args } />
						</div>
					) ) }
				</>
			) ) }
		</div>
	),
};
