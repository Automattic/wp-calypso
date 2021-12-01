import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { ReactElement, ReactNode } from 'react';

const CardTitle = styled.span`
	display: flex;
	height: 40px;
	align-items: center;
	.gridicon {
		width: 24px;
		margin-right: 24px;
		color: var( --studio-gray-40 );
	}

	h2 {
		font-size: 1.25rem;
		letter-spacing: 0.2px;
		color: var( --studio-gray-90 );
	}
`;

const CardBody = styled.div`
	padding: 0 0 0 48px;
	min-width: 300px;

	p {
		color: var( --studio-gray-60 );
		font-size: $font-body-small;
		letter-spacing: -0.16px;
		line-height: 1.25rem;
		margin-top: 30px;
	}
}`;

interface Card {
	title: string;
	icon?: string;
	children: ReactNode;
}

export default function Card( { title, icon = 'domains', children }: Card ): ReactElement | null {
	return (
		<>
			<CardTitle>
				<Gridicon icon={ icon } size={ 24 } />
				<h2>{ title }</h2>
			</CardTitle>
			<CardBody>{ children }</CardBody>
		</>
	);
}
