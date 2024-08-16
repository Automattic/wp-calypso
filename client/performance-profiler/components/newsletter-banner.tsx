import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

const Container = styled.div`
	background-color: #f7f8fe;
	padding: 24px;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 24px;
	justify-content: space-between;
	width: 100%;
`;

const Heading = styled.div`
	font-weight: 500;
	line-height: 24px;
	text-align: left;
`;

const Body = styled.div`
	color: var( --studio-gray-70 );
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
			<Button variant="primary">{ translate( 'Sign up for email reports' ) }</Button>
		</Container>
	);
};
