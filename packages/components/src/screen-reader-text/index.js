import './style.scss';

export default function ScreenReaderText( { children } ) {
	return <span className="screen-reader-text">{ children }</span>;
}
