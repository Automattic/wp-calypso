import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';
import './styles.scss';

const Progress = styled( ProgressBar )`
	background-color: #349f4b;

	div {
		background: linear-gradient( 90deg, #3858e9 0%, #349f4b 100% );
	}
`;

export const LoadingScreen = () => {
	const translate = useTranslate();

	return (
		<LayoutBlock className="landing-page-header-block" width="medium">
			<div className="landing-page-loading-screen">
				<h2>{ translate( "Crunching your site's numbers…" ) }</h2>
				<Progress value={ 50 } total={ 100 } />
			</div>
		</LayoutBlock>
	);
};
