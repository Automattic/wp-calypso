import { Card, ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import { FC } from 'react';
import footerCardBackground from 'calypso/assets/images/jetpack/jp-licensing-checkout-footer-bg.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface Props {
	className?: string;
	title: TranslateResult;
	footerImage?: string;
	showJetpackLogo?: boolean;
	showProgressIndicator?: boolean;
	progressIndicatorValue?: number;
	progressIndicatorTotal?: number;
}

const LicensingActivation: FC< Props > = ( {
	children,
	className,
	title,
	footerImage,
	showJetpackLogo = true,
	showProgressIndicator = false,
	progressIndicatorValue = 0,
	progressIndicatorTotal = 0,
} ) => {
	const progressBarProperties = {
		value: progressIndicatorValue,
		total: progressIndicatorTotal,
	};

	return (
		<Main fullWidthLayout className={ classnames( 'licensing-activation', className ) }>
			<Card className="licensing-activation__card">
				<div className="licensing-activation__card-main">
					<div className="licensing-activation__card-top">
						{ showJetpackLogo && <JetpackLogo size={ 45 } /> }
						{ showProgressIndicator && (
							<ProgressBar
								className="licensing-activation__progress-bar"
								{ ...progressBarProperties }
							/>
						) }
					</div>
					<h1 className="licensing-activation__title">{ title }</h1>
					{ children }
				</div>
				<div
					className="licensing-activation__card-footer"
					style={ { backgroundImage: `url(${ footerCardBackground })` } }
				>
					{ footerImage && (
						<div className="licensing-activation__card-footer-image">
							<img src={ footerImage } alt="Checkout Thank you" />
						</div>
					) }
				</div>
			</Card>
		</Main>
	);
};

export default LicensingActivation;
