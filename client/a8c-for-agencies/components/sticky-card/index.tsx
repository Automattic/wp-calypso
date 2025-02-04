import { Button } from '@automattic/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	className?: string;
	position?: 'top left' | 'top right' | 'bottom left' | 'bottom right';
	children: ReactNode;
	dismissable?: boolean;
	title?: string;
	onClose?: () => void;
};

export function StickyCard( {
	className,
	position = 'top right',
	children,
	title,
	dismissable,
	onClose,
}: Props ) {
	return (
		<div
			className={ clsx(
				'sticky-card',
				`is-positioned-${ position.replace( ' ', '-' ) }`,
				className
			) }
		>
			<div className="sticky-card__heading">
				<div className="sticky-card__heading-title">{ title }</div>
				{ dismissable && (
					<Button className="sticky-card__dismiss-button" plain>
						<Icon className="gridicon" icon={ close } onClick={ onClose } size={ 14 } />
					</Button>
				) }
			</div>

			<div className="sticky-card__body">{ children }</div>
		</div>
	);
}
