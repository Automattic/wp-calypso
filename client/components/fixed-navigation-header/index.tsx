import styled from '@emotion/styled';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { preventWidows } from 'calypso/lib/formatting';

const Header = styled.header`
	position: fixed;
	z-index: 1;
	top: var( --masterbar-height );
	left: var( --sidebar-width-max );
	width: calc( 100% - var( --sidebar-width-max ) );
	padding: 0 32px;
	box-sizing: border-box;
	border-bottom: 1px solid var( --studio-gray-5 );
	background-color: var( --studio-white );

	@media ( max-width: 782px ) {
		width: 100%;
		left: 0;
	}

	@media ( max-width: 660px ) {
		padding: 0 16px;
	}
`;

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	min-height: 70px;

	@media ( max-width: 660px ) {
		min-height: 60px;
	}

	.main.is-wide-layout & {
		max-width: 1040px;
		margin: auto;
	}
`;

const H1 = styled.h1``;

const ActionsContainer = styled.div`
	display: flex;
	align-items: center;
`;

interface Props {
	brandFont?: boolean;
	id?: string;
	headerText: string | ReactNode;
	className?: string;
	children?: ReactNode;
}

const FixedNavigationHeader: React.FunctionComponent< Props > = ( props ) => {
	const { brandFont, id, headerText, className, children } = props;
	const headerClasses = classNames( { 'wp-brand-font': brandFont } );

	return (
		<Header id={ id } className={ className }>
			<Container>
				<H1 className={ headerClasses }>{ preventWidows( headerText, 2 ) }</H1>
				<ActionsContainer>{ children }</ActionsContainer>
			</Container>
		</Header>
	);
};

FixedNavigationHeader.defaultProps = {
	id: '',
	className: '',
	brandFont: false,
};

export default FixedNavigationHeader;
