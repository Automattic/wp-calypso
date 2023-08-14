import classNames from 'classnames';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	borderless?: boolean;
};

export default function LayoutTop( { children, borderless }: Props ) {
	return (
		<div
			className={ classNames( 'partner-portal-layout__top', {
				'is-borderless': borderless,
			} ) }
		>
			<div className="partner-portal-layout__top-wrapper">{ children }</div>
		</div>
	);
}
