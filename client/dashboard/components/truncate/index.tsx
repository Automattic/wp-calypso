import { __experimentalTruncate as WPTruncate, Tooltip } from '@wordpress/components';
import { useMergeRefs, useResizeObserver } from '@wordpress/compose';
import { useState, forwardRef } from 'react';

export interface TruncateProps extends React.ComponentProps< typeof WPTruncate > {
	tooltip: string;
}

function UnforwardedTruncate(
	{ tooltip, numberOfLines = 0, ...props }: TruncateProps,
	forwardedRef: React.ForwardedRef< HTMLElement >
) {
	const [ isTruncated, setIsTruncated ] = useState( false );
	const resizeObserverRef = useResizeObserver( ( [ entry ] ) => {
		const style = window.getComputedStyle( entry.target );
		const lineHeight = parseFloat( style.lineHeight );
		setIsTruncated( entry.target.scrollHeight > lineHeight * numberOfLines );
	} );

	const children = (
		<WPTruncate
			ref={ useMergeRefs( [ resizeObserverRef, forwardedRef ] ) }
			numberOfLines={ numberOfLines }
			{ ...props }
		/>
	);

	if ( ! isTruncated ) {
		return children;
	}

	return <Tooltip text={ tooltip }>{ children }</Tooltip>;
}

export const Truncate = forwardRef( UnforwardedTruncate );
