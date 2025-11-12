import { Badge, Gridicon, SummaryButton } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import '../style.scss';

export default function Option( {
	benefits,
	disabled,
	illustration,
	learnMoreLink,
	onSelect,
	onSelectText,
	isPlaceholder,
	pricing,
	primary,
	recommended,
	titleText,
	topText,
} ) {
	const localizeUrl = useLocalizeUrl();

	return (
		<div
			className={ clsx( 'option', {
				'option--is-placeholder': isPlaceholder,
			} ) }
		>
			<SummaryButton
				className="option__button"
				title={
					<div className="option__title">
						{ titleText }
						{ recommended && <Badge type="info-green">{ __( 'Recommended' ) }</Badge> }
					</div>
				}
				description={
					<div className="option__description">
						<div className="option__top-text">{ topText }</div>
						{ learnMoreLink && (
							<a
								className="option__learn-more"
								target="_blank"
								href={ localizeUrl( learnMoreLink ) }
								onClick={ ( event ) => event.stopPropagation() }
								rel="noopener noreferrer"
							>
								{ __( 'Learn more' ) }
							</a>
						) }
					</div>
				}
				decoration={ illustration }
				onClick={ onSelect }
			/>
			{ benefits && (
				<div className="option__benefits">
					{ benefits.map( ( benefit, index ) => {
						return (
							<div key={ 'benefit-' + index } className="option__benefits-item">
								{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
								<Gridicon size={ 16 } icon="checkmark" />
								<span className="option__benefits-item-text">{ benefit }</span>
							</div>
						);
					} ) }
				</div>
			) }
		</div>
	);
}

Option.propTypes = {
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
};
