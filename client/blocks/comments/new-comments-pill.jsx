import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { flushSync } from 'react-dom';

import './new-comments-pill.scss';

const getFirstCommentElement = ( commentIds ) =>
	commentIds
		.map( ( commentId ) => window.document.getElementById( `comment-${ commentId }` ) )
		.filter( Boolean )
		.sort( ( a, b ) =>
			a.compareDocumentPosition( b ) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		)[ 0 ];

export default function NewCommentsPill( { commentIds, onReveal } ) {
	const translate = useTranslate();
	const count = commentIds.length;

	if ( ! count ) {
		return null;
	}

	const handleClick = () => {
		flushSync( onReveal );
		getFirstCommentElement( commentIds )?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
	};

	return (
		<Button
			__next40pxDefaultSize
			variant="primary"
			className="comments__new-comments-pill"
			onClick={ handleClick }
		>
			{ translate( '%(count)d new update', '%(count)d new updates', {
				count,
				args: { count },
			} ) }
		</Button>
	);
}
