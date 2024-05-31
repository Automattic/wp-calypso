import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';
import './styles.scss';

const Progress = styled( ProgressBar )`
	div {
		background: linear-gradient( 90deg, #3858e9 0%, #349f4b 100% );
	}
`;

export const LoadingScreen = () => {
	const translate = useTranslate();

	const progressHeadings = [
		translate( "Crunching your site's numbers…" ),
		translate( 'Analyzing speed metrics…' ),
		translate( 'Comparing with top sites…' ),
		translate( 'Finalizing your report…' ),
	];

	const [ progress, setProgress ] = useState( 0 );

	useEffect( () => {
		setTimeout( () => {
			if ( progress >= 100 ) {
				setProgress( 0 );
			} else {
				setProgress( progress + 10 );
			}
		}, 1000 );
	}, [ progress ] );

	return (
		<LayoutBlock className="landing-page-header-block" width="medium">
			<div className="landing-page-loading-screen">
				<h2>{ progressHeadings[ Math.floor( ( progress / 101 ) * progressHeadings.length ) ] }</h2>
				<Progress value={ progress } total={ 100 } canGoBackwards />
			</div>
		</LayoutBlock>
	);
};
