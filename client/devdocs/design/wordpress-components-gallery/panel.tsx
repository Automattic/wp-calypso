/**
 * External dependencies
 */
import React, { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import { Panel, PanelBody, PanelRow } from '@wordpress/components';

function ScrollableContainer( { children }: { children: ReactNode } ) {
	return (
		<div
			style={ {
				width: 300,
				height: 600,
				overflowY: 'auto',
				margin: 'auto',
				boxShadow: '0 0 0 1px #ddd inset',
			} }
		>
			{ children }
		</div>
	);
}

function Placeholder( { height = 200 } ) {
	return <div style={ { background: '#ddd', height, width: '100%' } } />;
}

const PanelExample = () => (
	<ScrollableContainer>
		<Panel header="My Panel">
			<PanelBody title="First Settings">
				<PanelRow>
					<Placeholder height={ 250 } />
				</PanelRow>
			</PanelBody>
			<PanelBody title="Second Settings" initialOpen={ false }>
				<PanelRow>
					<Placeholder height={ 400 } />
				</PanelRow>
			</PanelBody>
			<PanelBody title="Third Settings" initialOpen={ false }>
				<PanelRow>
					<Placeholder height={ 600 } />
				</PanelRow>
			</PanelBody>
			<PanelBody title="Fourth Settings" initialOpen={ false }>
				<PanelRow>
					<Placeholder />
				</PanelRow>
			</PanelBody>
		</Panel>
	</ScrollableContainer>
);

export default PanelExample;
