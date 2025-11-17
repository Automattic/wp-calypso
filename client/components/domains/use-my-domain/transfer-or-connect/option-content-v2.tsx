import { Badge, Gridicon, SummaryButton } from '@automattic/components';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import type { ReactNode, ReactElement } from 'react';

import '../style.scss';

type OptionContentV2Props = {
	benefits?: ReadonlyArray< ReactNode >;
	disabled?: boolean;
	illustration: ReactElement;
	onSelect?: React.MouseEventHandler;
	isPlaceholder?: boolean;
	recommended?: boolean;
	titleText: string;
	topText: ReactNode;
	etaText?: ReactNode;
};

export default function OptionContentV2( {
	benefits,
	disabled,
	illustration,
	onSelect,
	isPlaceholder,
	recommended,
	titleText,
	topText,
	etaText,
}: OptionContentV2Props ) {
	return (
		<div
			className={ clsx( 'option-content-v2', {
				'option-content-v2--is-placeholder': isPlaceholder,
			} ) }
		>
			<SummaryButton
				className="option-content-v2__button"
				title={
					<div className="option-content-v2__title">
						{ titleText }
						{ recommended && <Badge type="info-green">{ __( 'Recommended' ) }</Badge> }
					</div>
				}
				description={
					<div className="option-content-v2__description">
						<Text variant="muted" className="option-content-v2__top-text">
							{ topText }
						</Text>
						{ etaText && <Text className="option-content-v2__eta-text">{ etaText }</Text> }
					</div>
				}
				decoration={ illustration }
				onClick={ onSelect }
				disabled={ disabled || isPlaceholder }
			/>
			{ benefits && (
				<div className="option-content-v2__benefits">
					{ benefits.map( ( benefit, index ) => {
						return (
							<div key={ 'benefit-' + index } className="option-content-v2__benefits-item">
								{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
								<Gridicon size={ 18 } icon="checkmark" />
								<Text className="option-content-v2__benefits-item-text">{ benefit }</Text>
							</div>
						);
					} ) }
				</div>
			) }
		</div>
	);
}
