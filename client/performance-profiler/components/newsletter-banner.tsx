import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

const Container = styled.div`
	background-color: #f7f8fe;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 24px;
	justify-content: space-between;
	width: 100%;

	& > * {
		margin: 24px;
	}
`;

const Heading = styled.div`
	font-weight: 500;
	line-height: 24px;
	text-align: left;
`;

const Body = styled.div`
	color: var( --studio-gray-70 );
`;

const BlueberryButton = styled( Button )`
	// && is needed for specificity
	&& {
		background: #3858e9;
		border-color: #3858e9;
	}
`;

export const NewsletterBanner = () => {
	const translate = useTranslate();

	return (
		<Container>
			<div>
				<Heading>{ translate( 'Sign up for weekly performance reports—it’s free!' ) }</Heading>
				<Body>
					{ translate(
						'Monitor your site’s key performance metrics with a free report delivered to your inbox each week.'
					) }
				</Body>
				<Body>{ translate( 'All you need is a free WordPress.com account to get started.' ) }</Body>
			</div>
			<BlueberryButton variant="primary">
				{ translate( 'Sign up for email reports' ) }
			</BlueberryButton>
		</Container>
	);
};
