import { Badge, Gridicon, SummaryButton } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import type { ReactNode, ReactElement } from 'react';

import '../style.scss';

type OptionContentV2Props = {
	benefits?: ReadonlyArray< ReactNode >;
	disabled?: boolean;
	illustration: ReactElement;
	learnMoreLink?: string;
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
	learnMoreLink,
	onSelect,
	isPlaceholder,
	recommended,
	titleText,
	topText,
	etaText,
}: OptionContentV2Props ) {
	const localizeUrl = useLocalizeUrl();

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
						<Text className="option-content-v2__top-text">
							{ topText }
							{ learnMoreLink && (
								<>
									{ ' ' }
									<a
										className="option-content-v2__learn-more"
										target="_blank"
										href={ localizeUrl( learnMoreLink ) }
										onClick={ ( event ) => event.stopPropagation() }
										rel="noopener noreferrer"
									>
										{ __( 'Learn more' ) }
									</a>
								</>
							) }
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
