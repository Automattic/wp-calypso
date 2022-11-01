import React from 'react';
import bottomLeftImgSrc from 'calypso/assets/images/onboarding/sensei/progress-bg-bottom-left.png';
import topRightImgSrc from 'calypso/assets/images/onboarding/sensei/progress-bg-top-right.png';
import {
	Container,
	Content,
	Text,
	Progress,
	ProgressValue,
	TopRightImg,
	BottomLeftImg,
} from './components';

interface SenseiStepProgressProps {
	children: string;
}

export const SenseiStepProgress: React.FC< SenseiStepProgressProps > = ( { children } ) => {
	return (
		<Container>
			<TopRightImg src={ topRightImgSrc } />
			<Content>
				<Text>{ children }</Text>
				<Progress>
					<ProgressValue progress={ 40 } />
				</Progress>
			</Content>
			<BottomLeftImg src={ bottomLeftImgSrc } />
		</Container>
	);
};
