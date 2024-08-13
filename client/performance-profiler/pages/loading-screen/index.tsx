import { Gridicon } from '@automattic/components';
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
	background-color: #f7f8fe;
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

	useEffect( () => {
		const timeoutId = setTimeout( () => {
			if ( step === steps.length - 1 ) {
				return;
			}
			setStep( step + 1 );
		}, 5000 );

		return () => clearTimeout( timeoutId );
	} );

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
				<h2>Testing your site’s speed…</h2>
				{ steps.map( ( heading, index ) => (
					<span key={ index } className={ stepStatus( index, step ) }>
						<Gridicon icon="checkmark" size={ 18 } />
						{ heading }
					</span>
				) ) }
				<FootNote>
					<h4>{ translate( 'Performance Mattters' ) }</h4>
					<p>
						{ translate(
							'Walmart found that for every one second improvement in page load time they achieved, conversions increased by 2%.'
						) }
					</p>
				</FootNote>
			</StyledLoadingScreen>
		</LayoutBlock>
	);
};
