import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import './style.scss';

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	align-items: center;
	min-height: 500px;
`;

const CtaContainer = styled.div`
	justify-self: start;
`;

const ContentContainer = styled.div`
	justify-self: end;
`;

const Headline = styled.h3`
	font-size: 16px;
	padding-bottom: 10px;
`;

const Title = styled.h4`
	color: var( --studio-gray-90 );
	font-size: 45px;
	line-height: 1.19;
	padding-bottom: 30px;
`;

const CtaHeader: React.FunctionComponent< Props > = ( props ) => {
	const { children, title, subtitle, buttonText, buttonAction } = props;
	return (
		<Container>
			<CtaContainer>
				<Headline>{ title }</Headline>
				<Title>{ subtitle }</Title>
				<Button primary onClick={ buttonAction }>
					{ buttonText }
				</Button>
			</CtaContainer>
			<ContentContainer>{ children }</ContentContainer>
		</Container>
	);
};

export default CtaHeader;
