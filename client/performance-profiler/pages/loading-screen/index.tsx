import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

interface LoadingScreenProps {
	isSavedReport: boolean;
}

const StyledLoadingScreen = styled.div`
	padding: 15px 0;
	h2 {
		font-size: 20px;
		font-weight: 500;
		line-height: 26px;
		margin-bottom: 30px;
	}

	span {
		display: flex;
		align-items: center;
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
		margin-bottom: 15px;
		position: relative;

		.gridicons-checkmark {
			display: none;
		}

		&:before {
			content: '';
			display: inline-block;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			margin-right: 10px;
			border: 1px solid transparent;
		}

		@keyframes rotate {
			from {
				transform: rotate( 0deg );
			}
			to {
				transform: rotate( 360deg );
			}
		}

		@-webkit-keyframes rotate {
			from {
				-webkit-transform: rotate( 0deg );
			}
			to {
				-webkit-transform: rotate( 360deg );
			}
		}

		&.complete {
			.gridicons-checkmark {
				display: block;
				position: absolute;
				top: 8px;
				left: 7px;
				fill: #fff;
			}
			:before {
				background-color: var( --studio-green-30 );
				color: #fff;
			}
		}

		&.running:before {
			border: 1px solid var( --studio-gray-5 );
		}

		&.running:after {
			content: '';
			width: 30px;
			height: 30px;
			position: absolute;
			left: 0;
			top: 0;
			border: solid 1.5px rgba( 56, 88, 233, 1 );
			border-radius: 50%;
			border-right-color: transparent;
			border-bottom-color: transparent;
			-webkit-transition: all 0.5s ease-in;
			-webkit-animation-name: rotate;
			-webkit-animation-duration: 1s;
			-webkit-animation-iteration-count: infinite;
			-webkit-animation-timing-function: linear;

			transition: all 0.5s ease-in;
			animation-name: rotate;
			animation-duration: 1s;
			animation-iteration-count: infinite;
			animation-timing-function: linear;
		}

		&.incomplete {
			color: var( --studio-gray-20 );
			::before {
				border: 1px dashed var( --studio-gray-5 );
			}
		}
	}
`;

const FootNote = styled.div`
	max-width: 460px;
	background-color: #e7f0fa;
	padding: 25px;
	margin-top: 65px;

	h4 {
		font-size: 14px;
		font-weight: 500;
		line-height: 20px;
		margin-bottom: 10px;
	}

	p {
		font-size: 14px;
		margin-bottom: 0;
	}

	.learn-more-link {
		margin-top: 20px;
	}
`;

export const LoadingScreen = ( { isSavedReport }: LoadingScreenProps ) => {
	const translate = useTranslate();
	const [ step, setStep ] = useState( 0 );

	const steps = isSavedReport
		? [ translate( 'Getting your report…' ) ]
		: [
				translate( 'Loading your site' ),
				translate( 'Measuring Core Web Vitals' ),
				translate( 'Taking screenshots' ),
				translate( 'Fetching historic data' ),
				translate( 'Identifying performance improvements' ),
				translate( 'Finalizing your results' ),
		  ];

	const tips = [
		{
			heading: translate( 'Performance Mattters' ),
			description: translate(
				'Walmart found that for every one second improvement in page load time they achieved, conversions increased by 2%.'
			),
		},
		{
			heading: translate( 'Did you know?' ),
			description: translate(
				"WordPress.com hosting comes with unlimited bandwidth, visitors, and traffic so you'll never be surprised by extra fees."
			),
		},
		{
			heading: translate( 'Performance Mattters' ),
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
		const timeoutId = setTimeout( () => {
			if ( step === steps.length - 1 ) {
				return;
			}
			setStep( step + 1 );
		}, 5000 );

		return () => clearTimeout( timeoutId );
	} );

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

	const stepStatus = ( index: number, step: number ) => {
		if ( step > index ) {
			return 'complete';
		}
		if ( step === index ) {
			return 'running';
		}
		return 'incomplete';
	};

	return (
		<LayoutBlock className="landing-page-header-block">
			<StyledLoadingScreen>
				<h2>{ translate( "Testing your site's speed…" ) }</h2>
				{ steps.map( ( heading, index ) => (
					<span key={ index } className={ stepStatus( index, step ) }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ heading }
					</span>
				) ) }
				{ tips[ currentTip ] && (
					<FootNote>
						<h4>{ tips[ currentTip ].heading }</h4>
						<p>{ tips[ currentTip ].description }</p>
						{ tips[ currentTip ].link && (
							<p className="learn-more-link">
								<a href={ tips[ currentTip ].link } target="_blank" rel="noreferrer">
									{ translate( 'Learn more ↗' ) }
								</a>
							</p>
						) }
					</FootNote>
				) }
			</StyledLoadingScreen>
		</LayoutBlock>
	);
};
