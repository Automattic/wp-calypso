import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

const LoadingProgressContainer = styled.div`
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
			width: 1.875em;
			height: 1.875em;
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
				height: 100%;
				left: 0.4375em;
				fill: #fff;
				width: 1.125em;
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
			width: 1.875em;
			height: 1.875em;
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
			color: var( --studio-gray-50 );
			::before {
				border: 1px dashed var( --studio-gray-5 );
			}
		}
	}
`;

const useLoadingSteps = ( {
	isSavedReport,
	pageTitle,
	isLoadingPages,
}: {
	isSavedReport: boolean;
	pageTitle?: string;
	isLoadingPages?: boolean;
} ) => {
	const translate = useTranslate();

	const [ step, setStep ] = useState( 0 );

	let steps = [];

	if ( isLoadingPages ) {
		steps = [ translate( 'Getting your site pages' ) ];
	} else {
		steps = isSavedReport
			? [ translate( 'Getting your report…' ) ]
			: [
					pageTitle
						? translate( 'Loading: %(pageTitle)s', { args: { pageTitle } } )
						: translate( 'Loading your site' ),
					translate( 'Measuring Core Web Vitals' ),
					translate( 'Taking screenshots' ),
					translate( 'Fetching historic data' ),
					translate( 'Identifying performance improvements' ),
					translate( 'Finalizing your results' ),
			  ];
	}

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

	return {
		step,
		steps,
		stepStatus,
	};
};

export const PerformanceReportLoadingProgress = ( {
	pageTitle,
	isSavedReport,
	isLoadingPages,
	className,
}: {
	isSavedReport: boolean;
	pageTitle?: string;
	className?: string;
	isLoadingPages?: boolean;
} ) => {
	const { step, steps, stepStatus } = useLoadingSteps( {
		isSavedReport,
		pageTitle,
		isLoadingPages,
	} );

	return (
		<LoadingProgressContainer className={ className }>
			{ steps.map( ( heading, index ) => (
				<span key={ index } className={ stepStatus( index, step ) }>
					<Gridicon icon="checkmark" />
					{ heading }
				</span>
			) ) }
		</LoadingProgressContainer>
	);
};
