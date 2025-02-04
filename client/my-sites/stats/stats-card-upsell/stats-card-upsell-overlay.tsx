import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import React, { ReactNode } from 'react';

interface Props {
	className?: string;
	copyText: string | ReactNode;
	onClick: ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => void;
	buttonLabel?: string | TranslateResult;
	buttonComponent?: React.ReactNode;
}

const StatsCardUpsell: React.FC< Props > = ( {
	className,
	onClick,
	copyText,
	buttonLabel,
	buttonComponent,
} ) => {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'stats-card-upsell', className ) }>
			<div className="stats-card-upsell__content">
				<div className="stats-card-upsell__lock">
					<Gridicon icon="lock" />
				</div>
				<p className="stats-card-upsell__text">{ copyText }</p>
				{ buttonComponent ? (
					buttonComponent
				) : (
					<Button primary className="stats-card-upsell__button" onClick={ onClick }>
						{ buttonLabel || translate( 'Unlock' ) }
					</Button>
				) }
			</div>
		</div>
	);
};

export default StatsCardUpsell;
