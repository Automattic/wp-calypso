import { Badge, Gridicon, SummaryButton } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import '../style.scss';

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
} ) {
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
						<p className="option-content-v2__top-text">
							{ topText }{ ' ' }
							{ learnMoreLink && (
								<a
									className="option-content-v2__learn-more"
									target="_blank"
									href={ localizeUrl( learnMoreLink ) }
									onClick={ ( event ) => event.stopPropagation() }
									rel="noopener noreferrer"
								>
									{ __( 'Learn more' ) }
								</a>
							) }
						</p>
						{ etaText && <p className="option-content-v2__eta-text">{ etaText }</p> }
					</div>
				}
				decoration={ illustration }
				onClick={ onSelect }
				disabled={ disabled }
			/>
			{ benefits && (
				<div className="option-content-v2__benefits">
					{ benefits.map( ( benefit, index ) => {
						return (
							<div key={ 'benefit-' + index } className="option-content-v2__benefits-item">
								{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
								<Gridicon size={ 18 } icon="checkmark" />
								<span className="option-content-v2__benefits-item-text">{ benefit }</span>
							</div>
						);
					} ) }
				</div>
			) }
		</div>
	);
}

OptionContentV2.propTypes = {
	benefits: PropTypes.array,
	disabled: PropTypes.bool,
	illustration: PropTypes.node.isRequired,
	learnMoreLink: PropTypes.string,
	onSelect: PropTypes.func,
	onSelectText: PropTypes.string,
	pricing: PropTypes.object,
	primary: PropTypes.bool,
	recommended: PropTypes.bool,
	titleText: PropTypes.string.isRequired,
	topText: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ).isRequired,
	etaText: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
};
