import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { LoadingPlaceHolder } from '../../loading-placeholder';
import type { TranslateResult } from 'i18n-calypso';

export const List = styled.ul`
	list-style: none;
	margin: 20px 0 20px;
	font-weight: 600;
	font-size: 14px;
`;
export const ListItem = styled.li`
	display: flex;
	& div:first-of-type {
		margin: 0 8px 0 8px;
	}
`;
export const ButtonRow = styled.div`
	display: flex;
	justify-content: flex-start;
	margin: 16px 0;
	flex-direction: column;
	@media ( min-width: 780px ) {
		flex-direction: row;
	}
`;

export type TextBoxProps = {
	fontSize?: number;
	bold?: boolean;
	color?: 'gray';
	noBottomGap?: boolean;
};
export const TextBox = styled.div< TextBoxProps >`
	font-size: ${ ( { fontSize } ) => fontSize || 14 }px;
	font-weight: ${ ( { bold } ) => ( bold ? 600 : 400 ) };
	line-height: 20px;
	color: ${ ( { color } ) => {
		if ( color === 'gray' ) {
			return 'var(--studio-gray-50)';
		}
		return 'var(--color-text)';
	} };
	margin-bottom: ${ ( { noBottomGap } ) => ( noBottomGap ? 0 : '8px' ) };
`;

export const CrossIcon = styled( Gridicon )`
	color: #e53e3e;
`;

export const LoadingPlaceHolderText = styled( LoadingPlaceHolder )`
	width: 80px;
	display: inline-block;
	border-radius: 0;
`;

export function LazyDisplayText( {
	displayText = '',
	isLoading,
}: {
	displayText?: TranslateResult;
	isLoading: boolean;
} ) {
	return isLoading || ! displayText ? <LoadingPlaceHolderText /> : <>{ displayText }</>;
}
