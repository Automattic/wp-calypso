import { Gridicon, Popover } from '@automattic/components';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { SiteError } from '../types';

type Props = {
	errors?: SiteError[];
};

export default function SiteDataFieldErrorIndicator( { errors }: Props ) {
	const popoverContext = useRef( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );

	const highestSeverity =
		errors?.reduce( ( prev, current ) => {
			const severityOrder: Record< string, number > = { high: 3, medium: 2, low: 1 };
			return severityOrder[ prev ] >= severityOrder[ current.severity ] ? prev : current.severity;
		}, 'low' ) ?? 'low';

	return (
		<div
			className={ clsx( 'sites-dataviews__site-error-indicator', `is-${ highestSeverity }` ) }
			ref={ popoverContext }
			onMouseEnter={ () => setIsPopoverVisible( true ) }
			onMouseLeave={ () => setIsPopoverVisible( false ) }
			onTouchStart={ () => setIsPopoverVisible( true ) }
			onTouchEnd={ () => setIsPopoverVisible( false ) }
			role="button"
			tabIndex={ 0 }
		>
			{ !! errors?.length && <Gridicon size={ 18 } icon="notice-outline" /> }
			{ !! errors?.length && (
				<Popover
					className="sites-dataviews__site-error-popover"
					position="right"
					noArrow={ false }
					context={ popoverContext.current }
					isVisible={ isPopoverVisible }
				>
					<ul className="sites-dataviews__site-error-popover-list">
						{ errors.map( ( error, index ) => (
							<li
								key={ index }
								className={ `sites-dataviews__site-error-item is-${ error.severity }` }
							>
								{ error.message }
							</li>
						) ) }
					</ul>
				</Popover>
			) }
		</div>
	);
}
