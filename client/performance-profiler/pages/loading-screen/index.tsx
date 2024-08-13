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
		display: block;
		font-size: 16px;
		font-weight: 400;
		line-height: 24px;
		margin-bottom: 15px;
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

	const progressHeadings = isSavedReport
		? [ translate( 'Getting your report…' ) ]
		: [
				translate( 'Loading your site' ),
				translate( 'Measuring Core Web Vitals' ),
				translate( 'Taking screenshots' ),
				translate( 'Fetching historic data' ),
				translate( 'Identifying performance improvements' ),
				translate( 'Finalizing your results' ),
		  ];

	const [ step, setStep ] = useState( 0 );

	useEffect( () => {
		const timeoutId = setTimeout( () => {
			if ( step === progressHeadings.length - 1 ) {
				return;
			}
			setStep( step + 1 );
		}, 1000 );

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
		<LayoutBlock className="landing-page-header-block" width="medium">
			<StyledLoadingScreen>
				<h2>Testing your site’s speed…</h2>
				{ progressHeadings.map( ( heading, index ) => (
					<span key={ index } className={ stepStatus( index, step ) }>
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
