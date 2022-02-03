import { Steps } from './steps';

type Keys = keyof typeof Steps;
export type StepType = typeof Steps[ Keys ];
