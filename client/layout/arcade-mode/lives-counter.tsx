import { useArcadeIsActive } from './store';

export default function ArcadeLivesCounter() {
	const isActive = useArcadeIsActive();

	if ( ! isActive ) {
		return null;
	}

	return (
		<div className="masterbar__item-wrapper">
			<div className="masterbar__item arcade-lives" aria-label="30 lives" role="status">
				<span className="arcade-lives__icon" aria-hidden="true">
					🕹
				</span>
				<span className="masterbar__item-content">30 LIVES</span>
			</div>
		</div>
	);
}
