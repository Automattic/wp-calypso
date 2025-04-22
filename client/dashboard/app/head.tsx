import { createPortal } from 'react-dom';

export default function Head( { basePath }: { basePath: string } ) {
	return createPortal(
		<>
			<base href={ basePath + '/' } />
		</>,
		document.head
	);
}
