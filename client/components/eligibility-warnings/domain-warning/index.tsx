import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';

const Title = styled.span``;
const Container = styled.div``;
const Content = styled.div``;
const NewDomainSection = styled.div``;

const DomainEliibilityWarning: React.FunctionComponent< Props > = ( props ) => {
    const { sitename } = props;

    return (
        <Container>
            <Title className="DomainEligibilityWarning__title">
                New Store Domain
            </Title>
            <Content>       
                <NewDomainSection>
                    <span>{`${sitename}.wpstaging.com`}</span>
                </NewDomainSection>
                <p>
                {`By installing this product your subdomain will change. Your old subdomain (${sitename}.wordpress.com) will no longer work. You can change it to a custom domain on us at anytime in future.`}
                </p>
            </Content>      
        </Container>
    );
};

export default DomainEliibilityWarning;