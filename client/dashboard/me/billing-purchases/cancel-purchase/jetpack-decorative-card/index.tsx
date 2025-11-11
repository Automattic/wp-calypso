import cloudIcon from 'calypso/assets/images/jetpack/cloud-icon.svg';
import decorativeCardBackground from 'calypso/assets/images/jetpack/decorative-card-background.jpg';
import decorativeCardIcon from 'calypso/assets/images/jetpack/decorative-card-icon.svg';
import type { FC } from 'react';

interface Props {
	iconPath: string;
}

const JetpackDecorativeCard: FC< Props > = ( props ) => {
	const { iconPath } = props;

	return (
		<div className="jetpack-decorative-card">
			<div className="jetpack-decorative-card__header">
				{ /* This is a decorative image */ }
				<img
					alt=""
					src={ decorativeCardBackground }
					className="jetpack-decorative-card__header-background"
				/>
				<img alt="" className="jetpack-decorative-card__header-icon" src={ decorativeCardIcon } />
			</div>
			<div className="jetpack-decorative-card__body">
				<img className="jetpack-decorative-card__icon" src={ iconPath ?? cloudIcon } alt="" />
			</div>
		</div>
	);
};

export default JetpackDecorativeCard;
