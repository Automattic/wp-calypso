import { TextBlur } from '../text-blur';

export function TextSkeleton( { length }: { length: number } ) {
	const text = 'X'.repeat( length );

	return <TextBlur>{ text }</TextBlur>;
}
