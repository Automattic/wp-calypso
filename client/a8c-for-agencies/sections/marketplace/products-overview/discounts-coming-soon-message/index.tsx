import { useTranslate } from 'i18n-calypso';
import './style.scss';

type Props = {
	onLearnMoreClick: () => void;
};

export default function DiscountsComingSoonMessage( { onLearnMoreClick }: Props ) {
	const translate = useTranslate();

	return (
		<div className="discounts-coming-soon-message">
			<span className="discounts-coming-soon-message__text">
				{ translate( 'Tier-based discounts are coming soon.' ) }{ ' ' }
				<button
					className="discounts-coming-soon-message__link"
					onClick={ onLearnMoreClick }
					type="button"
				>
					{ translate( 'Learn more' ) }
				</button>
			</span>
		</div>
	);
}
