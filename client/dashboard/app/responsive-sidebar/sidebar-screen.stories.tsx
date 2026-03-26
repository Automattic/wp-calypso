import { Meta, StoryObj } from '@storybook/react';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { useState } from 'react';
import SidebarScreenTransition from './sidebar-screen';

import './sidebar-screen.scss';

const meta: Meta< typeof SidebarScreenTransition > = {
	title: 'client/dashboard/SidebarScreenTransition',
	component: SidebarScreenTransition,
};

export default meta;
type Story = StoryObj< typeof SidebarScreenTransition >;

function ScreenContent( {
	title,
	color,
	children,
}: {
	title: string;
	color: string;
	children?: React.ReactNode;
} ) {
	return (
		<VStack
			spacing={ 4 }
			style={ {
				padding: 16,
				background: color,
				borderRadius: 8,
				minHeight: 300,
			} }
		>
			<h3 style={ { margin: 0 } }>{ title }</h3>
			{ children }
		</VStack>
	);
}

function SidebarDemo() {
	const [ screen, setScreen ] = useState( 'root' );

	const isBack = screen === 'root';

	const renderScreen = () => {
		switch ( screen ) {
			case 'site':
				return (
					<ScreenContent title="Site: example.com" color="#e8f0fe">
						<Button variant="secondary" onClick={ () => setScreen( 'root' ) }>
							Back to Sites
						</Button>
						<p>Site overview, deployments, performance...</p>
					</ScreenContent>
				);
			case 'domain':
				return (
					<ScreenContent title="Domain: example.com" color="#fef7e0">
						<Button variant="secondary" onClick={ () => setScreen( 'root' ) }>
							Back to Domains
						</Button>
						<p>Domain settings, DNS, transfer...</p>
					</ScreenContent>
				);
			case 'me':
				return (
					<ScreenContent title="Account" color="#f0e8fe">
						<Button variant="secondary" onClick={ () => setScreen( 'root' ) }>
							Back
						</Button>
						<p>Profile, billing, security...</p>
					</ScreenContent>
				);
			default:
				return (
					<ScreenContent title="Dashboard" color="#f0f0f0">
						<VStack spacing={ 2 }>
							<Button variant="secondary" onClick={ () => setScreen( 'site' ) }>
								Sites →
							</Button>
							<Button variant="secondary" onClick={ () => setScreen( 'domain' ) }>
								Domains →
							</Button>
							<Button variant="secondary" onClick={ () => setScreen( 'me' ) }>
								Account →
							</Button>
						</VStack>
					</ScreenContent>
				);
		}
	};

	return (
		<VStack spacing={ 4 }>
			<HStack spacing={ 2 }>
				<span>Current: { screen }</span>
				<span>isBack: { String( isBack ) }</span>
			</HStack>
			<div
				style={ {
					width: 272,
					position: 'relative',
					overflow: 'hidden',
					border: '1px solid #ddd',
					borderRadius: 8,
				} }
			>
				<SidebarScreenTransition screenKey={ screen } isBack={ isBack }>
					{ renderScreen() }
				</SidebarScreenTransition>
			</div>
		</VStack>
	);
}

export const Default: Story = {
	render: () => <SidebarDemo />,
};
