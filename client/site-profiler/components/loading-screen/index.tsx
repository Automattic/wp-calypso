import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

interface LoadingScreenProps {
	isSavedReport: boolean;
}

const Progress = styled( ProgressBar )`
	div {
		background: linear-gradient( 90deg, #3858e9 0%, #349f4b 100% );
	}
`;

const StyledLoadingScreen = styled.div`
	padding: 100px 40px;

	h2 {
		text-align: center;
	}
`;

export const LoadingScreen = ( { isSavedReport }: LoadingScreenProps ) => {
	const translate = useTranslate();

	const progressHeadings = isSavedReport
		? [ translate( 'Getting your report…' ) ]
		: [
				translate( "Crunching your site's numbers…" ),
				translate( 'Analyzing speed metrics…' ),
				translate( 'Comparing with top sites…' ),
				translate( 'Finalizing your report…' ),
		  ];

	const [ progress, setProgress ] = useState( 0 );
	const [ tick, setTick ] = useState( 0 );

	useEffect( () => {
		const timeoutId = setTimeout( () => {
			const newProgress = 100 * ( 1 - Math.pow( 1.07, -tick ) );
			setProgress( newProgress );
			setTick( tick + 1 );
		}, 1000 );

		return () => clearTimeout( timeoutId );
	}, [ progress, tick ] );

	return (
		<LayoutBlock className="landing-page-header-block" width="medium">
			<StyledLoadingScreen>
				<h2>{ progressHeadings[ Math.floor( ( progress / 101 ) * progressHeadings.length ) ] }</h2>
				<Progress value={ progress } total={ 100 } />
			</StyledLoadingScreen>
		</LayoutBlock>
	);
};
