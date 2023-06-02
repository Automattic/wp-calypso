import { Global } from '@emotion/react';
import React from 'react';
import bottomLeftImgSrc from 'calypso/assets/images/onboarding/sensei/progress-bg-bottom-left.png';
import topRightImgSrc from 'calypso/assets/images/onboarding/sensei/progress-bg-top-right.png';
import {
	Container,
	Content,
	Title,
	Subtitle,
	Progress,
	ProgressValue,
	TopRightImg,
	BottomLeftImg,
} from './components';

export type Progress = {
	percentage: number;
	title: string;
	subtitle?: string;
};

type SenseiStepProgressProps = {
	progress: Progress;
};

export const SenseiStepProgress: React.FC< SenseiStepProgressProps > = ( { progress } ) => {
	return (
		<Container>
			<TopRightImg src={ topRightImgSrc } />
			<Content>
				<Title>{ progress.title }</Title>
				{ progress.subtitle && <Subtitle>{ progress.subtitle }</Subtitle> }
				<Progress>
					<ProgressValue progress={ progress.percentage } />
				</Progress>
			</Content>
			<BottomLeftImg src={ bottomLeftImgSrc } />
			<Global styles={ { '.sensei .flow-progress.progress-bar': { display: 'none' } } } />
		</Container>
	);
};
