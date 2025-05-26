import React from 'react';
import type { CommonLogoProps } from '../types';

type StorybookLogoTableProps = {
	logos: React.ComponentType< CommonLogoProps >[];
	props: CommonLogoProps;
};

export function StorybookLogoTable( { logos, props }: StorybookLogoTableProps ) {
	return (
		<div style={ { display: 'grid', gridTemplateColumns: 'min-content 1fr 1fr' } }>
			<div />
			<div style={ { display: 'flex', justifyContent: 'center', padding: '1rem' } }>
				<code>Simulated light theme</code>
			</div>
			<div style={ { display: 'flex', justifyContent: 'center', padding: '1rem' } }>
				<code>Simulated dark theme</code>
			</div>
			{ logos.map( ( Logo ) => (
				<React.Fragment key={ Logo.displayName }>
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
							<Logo { ...props } />
						</div>
					) ) }
				</React.Fragment>
			) ) }
		</div>
	);
}
