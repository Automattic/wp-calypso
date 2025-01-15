import { Button } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type TranslateResult } from 'i18n-calypso';
import { forwardRef } from 'react';
import { plansPageBreakSmall } from '../media-queries';
import '../style.scss';

const ComparisonGridToggle = forwardRef<
	HTMLAnchorElement | HTMLButtonElement,
	{
		onClick: () => void;
		label: TranslateResult;
	}
>( ( { onClick, label }, ref ) => {
	const Container = styled.div`
		display: flex;
		justify-content: center;
		margin-top: 32px;

		button {
			background: var( --studio-white );
			border: 1px solid var( --studio-gray-10 );
			border-radius: 4px;
			box-shadow: 0 1px 2px rgba( 0, 0, 0, 0.05 );
			color: var( --studio-gray-100 );
			font-size: var( --scss-font-body-small );
			height: 48px;
			justify-content: center;
			line-height: 20px;
			padding: 0 24px;
			width: 100%;
			max-width: 440px;
			transition: border-color 0.15s ease-out;

			${ plansPageBreakSmall( css`
				width: initial;
				height: 40px;
			` ) }

			&:not( [disabled] ):hover,
			&:not( [disabled] ):focus {
				border-color: var( --studio-gray-100 );
				box-shadow: none;
				color: inherit;
			}
		}
	`;

	return (
		<Container>
			<Button onClick={ onClick } ref={ ref }>
				{ label }
			</Button>
		</Container>
	);
} );

export default ComparisonGridToggle;
