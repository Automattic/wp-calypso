import './style.scss';

export function TextBlur( { text }: { text: string } ) {
	return <span className="text-blur" data-text={ text } />;
}
