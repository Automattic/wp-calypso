import { useMobileBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import EmailReportScreenshot from 'calypso/assets/images/performance-profiler/email-report-example-full.png';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const Container = styled.div`
	position: relative;
	overflow: hidden;
	background:
		linear-gradient( 90deg, var( --studio-gray-100 ) 50%, rgba( 16, 21, 23, 0 ) 100% ),
		fixed 10px 10px /16px 16px radial-gradient( var( --studio-gray-50 ) 1px, transparent 0 ),
		var( --studio-gray-100 );
	border-radius: 6px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	box-sizing: border-box;
	flex-wrap: wrap;
	padding: 48px 24px;

	@media ( max-width: 600px ) {
		background:
			linear-gradient( 180deg, var( --studio-gray-100 ) 50%, rgba( 16, 21, 23, 0 ) 100% ),
			fixed 10px 10px /16px 16px radial-gradient( var( --studio-gray-50 ) 1px, transparent 0 ),
			var( --studio-gray-100 );
	}
`;

const HeadingContainer = styled.div`
	flex: 1;
`;

const Heading = styled.div`
	font-weight: 500;
	line-height: 24px;
	text-align: left;
	color: var( --studio-white );
	margin-bottom: 6px;
	text-wrap: balance;
`;

const Body = styled.div`
	color: var( --studio-gray-20 );
	text-wrap: balance;
`;

const BlueberryButton = styled( Button )`
	// && is needed for specificity
	&& {
		margin-top: 24px;
		background: #3858e9;
		border-color: #3858e9;

		&:hover:not( :disabled ),
		&:active:not( :disabled ),
		&:focus:not( :disabled ) {
			background-color: darken( #3858e9, 10% );
			border-color: darken( #3858e9, 10% );
			box-shadow: none;
		}
	}
`;
const ImageWrapper = styled.div`
	/* min-width: 290px; */
	flex-basis: 230px;
`;
const EmailReportImage = styled.img`
	position: absolute;
	top: 24px;
	right: 24px;
	max-width: 200px;
	height: auto;
`;

export const NewsletterBanner = ( { link, onClick }: { link: string; onClick: () => void } ) => {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isMobile = useMobileBreakpoint();

	return (
		<Container>
			<HeadingContainer>
				<Heading>
					{ translate( 'Get notified about changes to your site’s performance—it’s free!' ) }
				</Heading>
				<Body>
					{ translate(
						'Monitor your site‘s key performance metrics with a free report delivered to your inbox each week.'
					) }
				</Body>
				{ ! isLoggedIn && (
					<Body>
						{ translate( 'All you need is a free WordPress.com account to get started.' ) }
					</Body>
				) }
				<BlueberryButton variant="primary" href={ link } onClick={ onClick }>
					{ isLoggedIn
						? translate( 'Enable email alerts' )
						: translate( 'Sign up for email reports' ) }
				</BlueberryButton>
			</HeadingContainer>
			{ ! isMobile && (
				<ImageWrapper>
					<EmailReportImage
						src={ EmailReportScreenshot }
						alt={ translate( 'Email report example' ) }
					/>
				</ImageWrapper>
			) }
		</Container>
	);
};
