import { TextBlur } from '../text-blur';

export function TextSkeleton( { length }: { length: number } ) {
	return <TextBlur isBlurred length={ length } />;
}
