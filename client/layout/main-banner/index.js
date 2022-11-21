import { Gridicon } from '@automattic/components';
import './style.scss';

export function MainBanner( { sectionName } ) {
	const allowList = [ 'posts', 'media', 'pages', 'home' ];
	if ( ! allowList.includes( sectionName ) ) {
		return null;
	}
	return (
		<div className="layout__launchpad-banner">
			<div className="layout__launchpad-banner-content">
				🚀
				<p>
					Finish onboarding in the Launchpad. Return by clicking
					<a href="/setup/launchpad?flow=newsletter"> here</a>
				</p>
			</div>
			<button
				className="layout__launchpad-banner-close-button"
				aria-label="close"
				// onClick={ closeBanner }
			>
				<Gridicon
					className="layout__launchpad-banner-close-button-close-icon"
					icon="cross"
					size={ 16 }
				/>
			</button>
		</div>
	);
}
