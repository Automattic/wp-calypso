import { Popover } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef } from 'react';
import './pattern-tooltip-dead-click.scss';

interface Props {
	targetRef: React.MutableRefObject< HTMLDivElement | null >;
	isVisible: boolean;
}

const PatternTooltipDeadClick = ( { targetRef, isVisible }: Props ) => {
	const translate = useTranslate();
	const ref = useRef< HTMLDivElement | null >( null );

	const anchor = useMemo( () => {
		return {
			getBoundingClientRect() {
				if ( ! ref.current || ! isVisible ) {
					return new window.DOMRect();
				}

				const { width, height } = ref.current.getBoundingClientRect();
				return new window.DOMRect( 0, 0, width, height );
			},
		};
	}, [] );

	useEffect( () => {
		const setXY = ( event: MouseEvent ) => {
			if ( ! ref.current ) {
				return;
			}

			const { clientX, clientY } = event;
			const { height, width } = ref.current.getBoundingClientRect();
			const x = Math.min( clientX, window.innerWidth - ( width + 32 ) );
			const y = Math.min( clientY, window.innerHeight - ( height + 32 ) );

			ref.current.style.transform = `translate( ${ x }px, ${ y }px )`;
		};

		const handleMouseDown = ( event: MouseEvent ) => {
			setXY( event );
		};

		const handleMouseMove = ( event: MouseEvent ) => {
			if ( isVisible ) {
				setXY( event );
			}
		};

		targetRef.current?.addEventListener( 'mousedown', handleMouseDown );
		targetRef.current?.addEventListener( 'mousemove', handleMouseMove );
		return () => {
			targetRef.current?.removeEventListener( 'mousedown', handleMouseDown );
			targetRef.current?.removeEventListener( 'mousemove', handleMouseMove );
		};
	}, [ targetRef, ref, isVisible ] );

	return (
		<Popover
			className="pattern-assembler__tooltip-dead-click"
			animate={ false }
			focusOnMount={ false }
			resize={ false }
			anchor={ anchor }
			placement="bottom-end"
			variant="unstyled"
		>
			<div
				className={ clsx( 'pattern-assembler__tooltip-dead-click-content', {
					'pattern-assembler__tooltip-dead-click-content--visible': isVisible,
				} ) }
				ref={ ref }
			>
				{ translate( 'You can edit your content later in the Site Editor' ) }
			</div>
		</Popover>
	);
};

export default PatternTooltipDeadClick;
