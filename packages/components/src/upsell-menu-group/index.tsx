import styled from '@emotion/styled';
import React from 'react';
import Gridicon from '../gridicon';

const Row = styled.div( {
	display: 'flex',
	flexDirection: 'row',
	paddingTop: 8,
	paddingBottom: 8,
	gap: 8,
} );

const Content = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	gap: 8,
	width: 210,
	whiteSpace: 'break-spaces',
	maxWidth: '80vw',
} );

const BackgroundIcon = styled.div( {
	backgroundColor: 'var(--color-accent)',
	width: 16,
	height: 16,
	borderRadius: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginTop: 1,
} );

const StarIcon = styled( Gridicon )( {
	color: '#FFF',
} );

export function UpsellIcon() {
	return (
		<BackgroundIcon>
			<StarIcon icon="star" size={ 10 } />
		</BackgroundIcon>
	);
}

interface UpsellCardProps {
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
}
export function UpsellMenuGroup( props: UpsellCardProps ) {
	const { icon = <UpsellIcon />, children, ...rest } = props;
	return (
		<Row { ...rest }>
			{ icon }
			<Content>{ children }</Content>
		</Row>
	);
}
