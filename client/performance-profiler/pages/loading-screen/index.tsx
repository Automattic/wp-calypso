import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { Tip } from 'calypso/performance-profiler/components/tip';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';
import { PerformanceReportLoadingProgress } from './progress';

interface LoadingScreenProps {
	isSavedReport: boolean;
}

const StyledLoadingScreen = styled.div`
	padding: 15px 0;
	h2 {
		font-size: 20px;
		font-weight: 500;
		line-height: 26px;
		margin-bottom: 5px;

		&.saved-report {
			margin-bottom: 30px;
		}
	}

	p {
		font-size: 14px;
		color: var( --studio-gray-70 );
		margin-bottom: 30px;
	}
`;

const TipContainer = styled.div`
	margin-top: 65px;
`;

export const LoadingScreen = ( { isSavedReport }: LoadingScreenProps ) => {
	const translate = useTranslate();

	const heading = isSavedReport
		? translate( 'Your site‘s results are ready' )
		: translate( 'Testing your site‘s speed…' );

	const tips = [
		{
			heading: translate( 'Performance Matters' ),
			description: translate(
				'Walmart found that for every one second improvement in page load time they achieved, conversions increased by 2%.'
			),
		},
		{
			heading: translate( 'Did you know?' ),
			description: translate(
				'WordPress.com hosting comes with unlimited bandwidth, visitors, and traffic so you‘ll never be surprised by extra fees.'
			),
		},
		{
			heading: translate( 'Performance Matters' ),
			description: translate(
				'British food brand COOK increased conversions by 7% after reducing page load time by 0.85 seconds.'
			),
		},
		{
			heading: translate( 'Fast, Free, Unlimited Migrations' ),
			description: translate(
				'Bring your site to WordPress.com for free in minutes, not hours, with our intuitive migration tools—backed by 24/7 support from our WordPress experts.'
			),
			link: localizeUrl( 'https://wordpress.com/move/' ),
		},
		{
			heading: translate( 'WordPress.com—Feel the Difference' ),
			description: translate(
				'Tap into our lightning-fast infrastructure—from a 28+ location global CDN to hundreds of WordPress optimizations, your site will be faster, smoother, and ready to take on anything.'
			),
			link: localizeUrl( 'https://wordpress.com/hosting/' ),
		},
	];
	const [ currentTip, setCurrentTip ] = useState( 0 );

	useEffect( () => {
		const updateCurrentTip = () => {
			setTimeout( () => {
				const randomTip = Math.floor( Math.random() * tips.length );
				setCurrentTip( randomTip );

				updateCurrentTip();
			}, 10000 );
		};

		updateCurrentTip();
	}, [] );

	return (
		<LayoutBlock className="landing-page-header-block">
			<StyledLoadingScreen>
				<h2 className={ isSavedReport ? 'saved-report' : '' }>{ heading }</h2>
				{ ! isSavedReport && <p>{ translate( 'This may take around 30 seconds.' ) }</p> }
				<PerformanceReportLoadingProgress isSavedReport={ isSavedReport } />
				{ tips[ currentTip ] && (
					<TipContainer>
						<Tip
							title={ tips[ currentTip ].heading }
							content={ tips[ currentTip ].description }
							link={ tips[ currentTip ].link }
						/>
					</TipContainer>
				) }
			</StyledLoadingScreen>
		</LayoutBlock>
	);
};
