import { Card } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import statsPurchaseBackgroundSVG from 'calypso/assets/images/stats/purchase-background.svg';
import StatsPurchaseSVG from './stats-purchase-svg';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';
import './styles.scss';

const StatsPurchaseNotice = ( { message } ) => {
	const translate = useTranslate();

	return (
		<div className={ classNames( COMPONENT_CLASS_NAME, `${ COMPONENT_CLASS_NAME }__notice` ) }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--left` }>
						<h2>{ translate( 'Success!' ) }</h2>
						<p>{ message }</p>
					</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchaseSVG />
						<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right-background` }>
							<img src={ statsPurchaseBackgroundSVG } alt="Blurred background" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default StatsPurchaseNotice;
