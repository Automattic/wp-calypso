import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { flushSync } from 'react-dom';

import './new-comments-pill.scss';

export default function NewCommentsPill( { commentIds, onReveal } ) {
	const translate = useTranslate();
	const count = commentIds.length;

	if ( ! count ) {
		return null;
	}

	const handleClick = () => {
		flushSync( onReveal );
		window.document
			.getElementById( `comment-${ commentIds.at( -1 ) }` )
			?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
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
