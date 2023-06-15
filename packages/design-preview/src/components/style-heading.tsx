import { PremiumBadge } from '@automattic/design-picker';

interface Props {
	title: string;
	description?: string;
	isPremium?: boolean;
}

const StyleHeading = ( { title, description, isPremium }: Props ) => {
	return (
		<div className="design-preview__style-heading">
			<div>
				<h2>{ title }</h2>
				{ isPremium && <PremiumBadge shouldHideTooltip /> }
			</div>
			{ description && <p>{ description }</p> }
		</div>
	);
};

export default StyleHeading;
