import { formatNumber } from '@automattic/number-formatters';
import { speak } from '@wordpress/a11y';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';

import './new-comments-pill.scss';

export default function NewCommentsPill( { commentIds, onReveal } ) {
	const translate = useTranslate();
	const count = commentIds.length;
	const label = translate( '%(count)s new update', '%(count)s new updates', {
		count,
		args: { count: formatNumber( count ) },
	} );

	useEffect( () => {
		if ( count ) {
			speak( label );
		}
	}, [ count, label ] );

	if ( ! count ) {
		return null;
	}

	const handleClick = () => {
		flushSync( onReveal );

		// A comment can stay hidden after reveal, e.g. inside a collapsed reply list.
		const target = commentIds
			.map( ( commentId ) => window.document.getElementById( `comment-${ commentId }` ) )
			.filter( Boolean )
			.at( -1 );

		if ( target ) {
			target.tabIndex = -1;
			target.scrollIntoView( { behavior: 'smooth', block: 'start' } );
			target.focus( { preventScroll: true } );
		}
	};

	return (
		<Button
			__next40pxDefaultSize
			variant="primary"
			className="comments__new-comments-pill"
			onClick={ handleClick }
		>
			{ label }
		</Button>
	);
}
