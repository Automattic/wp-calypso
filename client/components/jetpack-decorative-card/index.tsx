import * as React from 'react';
import cloudIcon from 'calypso/assets/images/jetpack/cloud-icon.svg';
import decorativeCardBackground from 'calypso/assets/images/jetpack/decorative-card-background.jpg';
import decorativeCardIcon from 'calypso/assets/images/jetpack/decorative-card-icon.svg';

interface Props {
	iconPath: string;
}

import './style.scss';

const JetpackDecorativeCard: React.FC< Props > = ( props ) => {
	const { iconPath } = props;

	return (
		<div className="jetpack-decorative-card">
			<div className="jetpack-decorative-card__header">
				<img
					alt="" // This is a decorative image
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
