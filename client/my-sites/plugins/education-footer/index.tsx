import styled from '@emotion/styled';
import LinkCardSection from './link-card-section';
import StaticInfoSection from './static-info-section';

const EducationFooterContainer = styled.div`
	margin-top: 96px;
`;

const EducationFooter = () => {
	return (
		<EducationFooterContainer>
			<LinkCardSection />
			<StaticInfoSection />
		</EducationFooterContainer>
	);
};

export default EducationFooter;
