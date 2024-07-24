import Background1Image from './background-1.svg';
import Background2Image from './background-2.svg';
import Background3Image from './background-3.svg';

export type SectionBackground = {
	image: string;
	color: string;
};

export const BackgroundType1: SectionBackground = {
	image: `url(${ Background1Image })`,
	color: '#EBF4FA',
};

export const BackgroundType2: SectionBackground = {
	image: `url(${ Background2Image })`,
	color: '#EBF4FA',
};

export const BackgroundType3: SectionBackground = {
	image: `url(${ Background3Image })`,
	color: '#EBF4FA',
};
