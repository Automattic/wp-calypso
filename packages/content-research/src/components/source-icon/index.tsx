import type { Source } from '../../types';

interface SourceIconProps {
	className?: string;
	label?: string;
	source: Source;
}

export default function SourceIcon( { className, label, source }: SourceIconProps ) {
	return (
		<span
			className={ `content-research-source-icon content-research-source-icon--${ source } ${
				className ?? ''
			}`.trim() }
			role={ label ? 'img' : undefined }
			aria-label={ label }
			title={ label }
		>
			{ getSourceIcon( source ) }
		</span>
	);
}

function getSourceIcon( source: Source ) {
	switch ( source ) {
		case 'myposts':
			return <PostsIcon />;
		case 'reader':
			return <WordPressIcon />;
		case 'hn':
			return <HackerNewsIcon />;
		case 'googlenews':
			return <GoogleNewsIcon />;
	}
}

function PostsIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path className="is-sheet" d="M6 3.5h8.8L19 7.7v12.8H6v-17z" />
			<path
				className="is-border"
				d="M14.2 5.1H7.5v13.8h10V8.4h-3.3V5.1zm1.5.9 1.1 1.1h-1.1V6zM6 3.5h8.8L19 7.7v12.8H6v-17z"
				fillRule="evenodd"
			/>
			<path className="is-line" d="M9 10.4h6v1.3H9v-1.3zm0 3h6v1.3H9v-1.3z" />
		</svg>
	);
}

function WordPressIcon() {
	return (
		<svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
			<path d="M36,0C16.1,0,0,16.1,0,36c0,19.9,16.1,36,36,36c19.9,0,36-16.2,36-36C72,16.1,55.8,0,36,0z M3.6,36 c0-4.7,1-9.1,2.8-13.2l15.4,42.3C11.1,59.9,3.6,48.8,3.6,36z M36,68.4c-3.2,0-6.2-0.5-9.1-1.3l9.7-28.2l9.9,27.3 c0.1,0.2,0.1,0.3,0.2,0.4C43.4,67.7,39.8,68.4,36,68.4z M40.5,20.8c1.9-0.1,3.7-0.3,3.7-0.3c1.7-0.2,1.5-2.8-0.2-2.7 c0,0-5.2,0.4-8.6,0.4c-3.2,0-8.5-0.4-8.5-0.4c-1.7-0.1-2,2.6-0.2,2.7c0,0,1.7,0.2,3.4,0.3l5,13.8L28,55.9L16.2,20.8 c2-0.1,3.7-0.3,3.7-0.3c1.7-0.2,1.5-2.8-0.2-2.7c0,0-5.2,0.4-8.6,0.4c-0.6,0-1.3,0-2.1,0C14.7,9.4,24.7,3.6,36,3.6 c8.4,0,16.1,3.2,21.9,8.5c-0.1,0-0.3,0-0.4,0c-3.2,0-5.4,2.8-5.4,5.7c0,2.7,1.5,4.9,3.2,7.6c1.2,2.2,2.7,4.9,2.7,8.9 c0,2.8-0.8,6.3-2.5,10.5l-3.2,10.8L40.5,20.8z M52.3,64l9.9-28.6c1.8-4.6,2.5-8.3,2.5-11.6c0-1.2-0.1-2.3-0.2-3.3 c2.5,4.6,4,9.9,4,15.5C68.4,47.9,61.9,58.4,52.3,64z" />
		</svg>
	);
}

function HackerNewsIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<rect width="24" height="24" rx="4" />
			<path d="M7 5h2.3l2.7 4.7L14.7 5H17l-4 6.7V19h-2v-7.3L7 5z" />
		</svg>
	);
}

function GoogleNewsIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
			<path d="M4.5 6.2 16.3 3l3.2 11.8L7.7 18 4.5 6.2z" className="is-blue" />
			<path d="M3 8.4h14.3v10.8H3V8.4z" className="is-green" />
			<path d="M6.7 5.7H21V17H6.7V5.7z" className="is-yellow" />
			<path d="M8.1 8.1h11.2v8.1H8.1V8.1z" className="is-white" />
			<path
				d="M9.6 10.1h7.8v1.2H9.6v-1.2zm0 2.2h7.8v1.2H9.6v-1.2zm0 2.2h5.6v1.2H9.6v-1.2z"
				className="is-red"
			/>
		</svg>
	);
}
