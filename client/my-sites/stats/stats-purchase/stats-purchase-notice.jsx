import { Card, Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import statsPurchaseBackgroundSVG from 'calypso/assets/images/stats/purchase-background.svg';
import StatsPurchaseSVG from './stats-purchase-svg';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';
import './styles.scss';

const StatsCommercialOwned = ( { siteSlug } ) => {
	const translate = useTranslate();

	const handleClick = () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;

		page.redirect( trafficPageUrl );
	};

	return (
		<>
			<h1>{ translate( 'You have already purchased Jetpack Stats Commercial!' ) }</h1>
			<p>
				{ translate(
					'It appears that you have already purchased a license for this product, and it has been successfully activated. You now have access to:'
				) }
			</p>
			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
					<li>{ translate( 'Real-time data on visitors' ) }</li>
					<li>{ translate( 'Traffic stats and trends for post and pages' ) }</li>
					<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
					<li>{ translate( 'GDPR compliant' ) }</li>
					<li>{ translate( 'Access to upcoming advanced features' ) }</li>
					<li>{ translate( 'Priority support' ) }</li>
					<li>{ translate( 'Commercial use' ) }</li>
				</ul>
			</div>
			<Button variant="primary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
		</>
	);
};

const StatsPurchaseNotice = ( { siteSlug } ) => {
	// TODO: use props to swap multiple versions of the left side content

	return (
		<div className={ classNames( COMPONENT_CLASS_NAME, `${ COMPONENT_CLASS_NAME }--single` ) }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--left` }>
						<StatsCommercialOwned siteSlug={ siteSlug } />
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
