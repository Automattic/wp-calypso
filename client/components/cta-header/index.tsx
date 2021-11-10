import { Button } from '@automattic/components';
import styled from '@emotion/styled';

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
`;

const CtaContainer = styled.div``;

const ContentContainer = styled.div``;

const CtaHeader: React.FunctionComponent< Props > = ( props ) => {
	const { children, title, subtitle, buttonText, buttonAction } = props;
	return (
		<Container>
			<CtaContainer>
				<h3>{ title }</h3>
				<h4>{ subtitle }</h4>
				<Button onClick={ buttonAction }>{ buttonText }</Button>
			</CtaContainer>
			<ContentContainer>{ children }</ContentContainer>
		</Container>
	);
};

export default CtaHeader;
