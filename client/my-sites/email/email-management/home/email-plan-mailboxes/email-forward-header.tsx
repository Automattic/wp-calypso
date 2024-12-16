import { CompactCard } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

type Props = React.PropsWithChildren< {
	className?: string;
} >;
export default function EmailForwardHeader( { className, children }: Props ) {
	const translate = useTranslate();

	return (
		<div className={ clsx( className, 'email-plan-mailboxes-list__email-forward-header' ) }>
			<CompactCard className="section-header">
				<div className="section-header__label">
					<span className="section-header__label-text">{ translate( 'Email forwards' ) }</span>
				</div>
				<div className="section-header__label">
					<span className="section-header__label-text">{ translate( 'Destination' ) }</span>
				</div>
				<div className="section-header__actions">
					<Button isLink>{ translate( 'Add forward' ) }</Button>
				</div>
			</CompactCard>
			{ children }
		</div>
	);
}
